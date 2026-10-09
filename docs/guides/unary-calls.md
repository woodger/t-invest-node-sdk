# Unary-вызовы

> Type: Guide. Здесь показаны связанные unary-запросы через публичный SDK facade, отдельный deadline для каждого вызова и чтение response metadata.

## Полный сценарий

Сценарий разобран на отдельные примеры: получение портфеля, минутных свечей и активных сигналов. Каждый RPC получает собственный deadline. Во всех фрагментах используется один `sdk`; его освобождение показано ниже.

### Создание SDK

```ts
import { TInvestNodeSDK } from '@woodger/t-invest-node-sdk';

const sdk = new TInvestNodeSDK({
  token: 'YOUR_TOKEN',
  endpoint: 'invest-public-api.tbank.ru:443'
});
```

### Портфель доступного счёта

```ts
import { PortfolioRequest_CurrencyRequest } from '@woodger/t-invest-node-sdk';

const { accounts } = await sdk.users.getAccounts(
  {},
  { signal: AbortSignal.timeout(5_000) }
);
const account = accounts[0];

if (account) {
  const portfolio = await sdk.operations.getPortfolio(
    {
      accountId: account.id,
      currency: PortfolioRequest_CurrencyRequest.RUB
    },
    { signal: AbortSignal.timeout(5_000) }
  );

  console.log(portfolio);
}
else {
  console.log('Нет доступных счетов');
}
```

### Минутные свечи

```ts
import { CandleInterval } from '@woodger/t-invest-node-sdk';

const to = new Date();
const from = new Date(to.getTime() - 5 * 60 * 1000);
const { candles } = await sdk.marketData.getCandles(
  {
    instrumentId: 'BBG00QPYJ5H0',
    interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
    from,
    to
  },
  { signal: AbortSignal.timeout(5_000) }
);

console.log(candles);
```

### Активные сигналы

```ts
import { SignalState } from '@woodger/t-invest-node-sdk';

const { strategies } = await sdk.signals.getStrategies(
  {},
  { signal: AbortSignal.timeout(5_000) }
);
const strategy = strategies[0];

if (strategy) {
  const { signals } = await sdk.signals.getSignals(
    {
      strategyId: strategy.strategyId,
      active: SignalState.SIGNAL_STATE_ACTIVE,
      from: new Date(Date.now() - 24 * 60 * 60 * 1000),
      to: new Date(),
      paging: { limit: 20, pageNumber: 0 }
    },
    { signal: AbortSignal.timeout(5_000) }
  );

  console.log(signals);
}
else {
  console.log('Нет доступных стратегий');
}
```

## Опции отдельного вызова

`TInvestCallOptions` действует на один RPC:

- `signal` отменяет ожидание локальной unary-квоты и последующий transport call;
- `onHeader` получает initial response metadata;
- `onTrailer` получает trailing response metadata.

Например, прочитать лимит и остаток квоты можно прямо в callbacks:

```ts
await sdk.users.getAccounts({}, {
  signal: AbortSignal.timeout(5_000),
  onHeader(metadata) {
    console.log('Лимит запросов:', metadata.get('x-ratelimit-limit'));
  },
  onTrailer(metadata) {
    console.log('Осталось запросов:', metadata.get('x-ratelimit-remaining'));
    console.log('Сброс квоты:', metadata.get('x-ratelimit-reset'));
  }
});
```

Metadata callbacks работают синхронно. Если `onHeader` или `onTrailer` бросает исключение, SDK отклоняет той же ошибкой текущий RPC и отменяет незавершённый transport call. Не передавайте сюда `async` functions: обрабатывайте metadata асинхронно после завершения вызова.

`AbortSignal.timeout()` создает независимый deadline для каждого вызова в примере. Если один signal нужно разделить между несколькими RPC, его отмена остановит все вызовы, которым он был передан.

SDK управляет заголовками authorization и instance `x-app-name`. Он добавляет Consumer metadata к instance metadata, но не позволяет подменить эти два заголовка.

## Освобождение ресурсов

После завершения запросов вызовите:

```ts
sdk.close();
```

В приложении закрывайте SDK в `finally`, как в руководстве [Первый SDK-вызов](./getting-started.md), чтобы освободить channel и при ошибке запроса.

## Устаревшие поля провайдера

Публичные generated declarations повторяют исходный контракт T-Invest вместе с пометками `@deprecated`. Не переносите такое поле автоматически в стабильную доменную или HTTP-модель: сначала разберитесь в его бизнес-смысле и контракте замены.

В частности, `klong` и `kshort` описывают коэффициенты ставки риска по клиенту, а `dlong` и `dshort` — ставки риска начальной маржи. SDK не подставляет `dlong`/`dshort` вместо `klong`/`kshort` и не объявляет их прямой заменой.

Отчёты CLI ветки `0.4.x` сохраняли `klong` и `kshort` для совместимости. Начиная с `0.5.0` нормализованный JSON-вывод CLI не содержит эти поля. `dlong` и `dshort` остаются отдельными полями со своей семантикой и не подставляются вместо удалённых значений. Публичные generated DTO по-прежнему дословно отражают upstream-контракт, поэтому прямые service-вызовы продолжают возвращать `klong` и `kshort`, пока они присутствуют в T-Invest API.

Алиас CLI `--figi` сохранён для совместимости, но его значение преобразуется в актуальное protobuf-поле `instrumentId`. Во встроенном CLI устаревшие FIGI-поля контрактов запросов и подписок сохраняют значения по умолчанию protobuf и не сериализуются. При прямом вызове фасада сервисов содержимое сгенерированного запроса по-прежнему задаёт сам Consumer.

Consumer-у стоит:

- не переносить устаревшие поля провайдера за пределы транспортного адаптера, если у приложения нет подтвержденного бизнес-сценария;
- пометить уже опубликованные `klong`/`kshort` как устаревшие и сохранить их на переходный период, если от них зависят внешние клиенты;
- вводить `dlong`/`dshort` как отдельные поля с собственной семантикой, а не как переименование или резервную подстановку для `klong`/`kshort`;
- изолировать временное чтение устаревших полей и объяснять точечное подавление `typescript/no-deprecated` на границе адаптера T-Invest.

## Ограничение частоты запросов

Unary limiter по умолчанию выключен. Consumer может передать собственную реализацию через `TInvestOptions.unaryLimiter`; SDK передаст ей package quota и объединённый `AbortSignal`. Подробный контракт разобран в [руководстве по собственной реализации](./custom-unary-limiter.md), а значения provider-а — в [лимитной политике](../limits-policy.md).

Не повторяйте `RESOURCE_EXHAUSTED` только из-за кода. Перед retry учтите idempotency RPC, metadata provider-а и backoff. Пример narrowing есть в руководстве [Ошибки и lifecycle](./errors-and-lifecycle.md).
