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

## Ограничение частоты запросов

По умолчанию SDK отправляет unary-запросы без ожидания квоты. Как подключить готовый ограничитель и настроить квоты, показано в [руководстве по ограничению частоты запросов](./unary-limits.md).

Код `RESOURCE_EXHAUSTED` сам по себе не означает, что запрос можно повторить. Учитывайте идемпотентность RPC, метаданные провайдера и задержку между попытками. Пример проверки ошибки есть в руководстве [Ошибки и lifecycle](./errors-and-lifecycle.md).

<a id="устаревшие-поля-провайдера"></a>

Различия устаревших полей риска и переход на новые контракты разобраны в руководстве [Устаревшие поля провайдера](./deprecated-fields.md).
