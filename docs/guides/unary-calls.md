# Unary-вызовы

> Type: Guide. Здесь показаны связанные unary-запросы, ограничение времени отдельного вызова и чтение метаданных ответа.

## Полный сценарий

Сценарий разобран на отдельные примеры: получение портфеля, минутных свечей и активных сигналов. Для каждого RPC задано собственное ограничение времени. Во всех фрагментах используется один `sdk`; его освобождение показано ниже.

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

- `signal` отменяет ожидание локальной unary-квоты и последующий gRPC-вызов;
- `onHeader` получает начальные метаданные ответа;
- `onTrailer` получает метаданные завершения ответа.

Например, прочитать лимит и остаток квоты можно прямо в обработчиках:

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

Обработчики метаданных работают синхронно. Если `onHeader` или `onTrailer` выбрасывает исключение, SDK отклоняет текущий RPC той же ошибкой и отменяет незавершённый gRPC-вызов. Не передавайте сюда `async`-функции: обрабатывайте метаданные асинхронно после завершения вызова.

`AbortSignal.timeout()` ограничивает время каждого вызова в примере независимо от остальных. Если один сигнал передан нескольким RPC, его отмена остановит все эти вызовы.

SDK управляет заголовками `authorization` и `x-app-name` экземпляра. Он добавляет метаданные отдельного вызова к метаданным экземпляра, но не позволяет подменить эти два заголовка.

## Освобождение ресурсов

После завершения запросов вызовите:

```ts
sdk.close();
```

В приложении закрывайте SDK в `finally`, как в руководстве [Первый SDK-вызов](./getting-started.md), чтобы освободить канал и при ошибке запроса.

## Устаревшие поля провайдера

Публичные сгенерированные типы повторяют исходный контракт T-Invest вместе с пометками `@deprecated`. Не переносите такое поле автоматически в стабильную доменную или HTTP-модель: сначала разберитесь в его бизнес-смысле и контракте замены.

В частности, `klong` и `kshort` описывают коэффициенты ставки риска по клиенту, а `dlong` и `dshort` — ставки риска начальной маржи. SDK не подставляет `dlong`/`dshort` вместо `klong`/`kshort` и не объявляет их прямой заменой.

Отчёты CLI ветки `0.4.x` сохраняли `klong` и `kshort` для совместимости. Начиная с `0.5.0` нормализованный JSON-вывод CLI не содержит эти поля. `dlong` и `dshort` остаются отдельными полями со своей семантикой и не подставляются вместо удалённых значений.

Публичные сгенерированные DTO по-прежнему дословно отражают исходный контракт. Поэтому прямые вызовы сервисов продолжают возвращать `klong` и `kshort`, пока они присутствуют в T-Invest API.

Псевдоним CLI `--figi` сохранён для совместимости, но его значение преобразуется в актуальное protobuf-поле `instrumentId`. Во встроенном CLI устаревшие FIGI-поля контрактов запросов и подписок сохраняют значения по умолчанию protobuf и не сериализуются. При прямом вызове фасада сервисов содержимое сгенерированного запроса по-прежнему задаёт само приложение.

Приложению стоит:

- не переносить устаревшие поля провайдера за пределы транспортного адаптера, если у приложения нет подтвержденного бизнес-сценария;
- пометить уже опубликованные `klong`/`kshort` как устаревшие и сохранить их на переходный период, если от них зависят внешние клиенты;
- вводить `dlong`/`dshort` как отдельные поля с собственной семантикой, а не как переименование или резервную подстановку для `klong`/`kshort`;
- изолировать временное чтение устаревших полей и объяснять точечное подавление `typescript/no-deprecated` на границе адаптера T-Invest.

## Ограничение частоты запросов

По умолчанию SDK не ограничивает частоту unary-запросов. Приложение может передать собственный ограничитель через `TInvestOptions.unaryLimiter`; SDK передаст ему квоту пакета и объединённый `AbortSignal`. Подробный контракт разобран в [руководстве по собственной реализации](./custom-unary-limiter.md), а значения провайдера — в [лимитной политике](../limits-policy.md).

Код `RESOURCE_EXHAUSTED` сам по себе не означает, что запрос можно повторить. Учитывайте идемпотентность RPC, метаданные провайдера и задержку между попытками. Пример проверки ошибки есть в руководстве [Ошибки и lifecycle](./errors-and-lifecycle.md).
