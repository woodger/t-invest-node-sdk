# Потоки и отмена

> Type: Guide. Здесь показано, как приложение владеет долгоживущим stream lifecycle, передаёт свой `AbortSignal` и останавливает transport call перед закрытием SDK.

## Server-side поток

Пример устанавливает обработчики сигналов процесса, передаёт один `AbortSignal` в stream RPC и считает локальную отмену штатным завершением. Ошибка provider-а проходит без маскировки.

```ts
import {
  isSdkError,
  SdkErrorCode,
  SubscriptionAction,
  SubscriptionInterval,
  TInvestNodeSDK
} from '@woodger/t-invest-node-sdk';

const sdk = new TInvestNodeSDK({
  token: 'YOUR_TOKEN',
  endpoint: 'invest-public-api.tbank.ru:443'
});
const shutdown = new AbortController();
const requestShutdown = () => shutdown.abort();

process.once('SIGINT', requestShutdown);
process.once('SIGTERM', requestShutdown);

try {
  const responses = sdk.marketdataStream.marketDataServerSideStream(
    {
      subscribeCandlesRequest: {
        subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
        instruments: [
          {
            instrumentId: 'BBG00QPYJ5H0',
            interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE
          }
        ],
        waitingClose: false
      }
    },
    { signal: shutdown.signal }
  );

  for await (const response of responses) {
    if (response.candle) {
      console.log(response.candle);
    }
  }
}
catch (error) {
  if (
    !shutdown.signal.aborted
    || !isSdkError(error, SdkErrorCode.Cancelled)
    || error.source !== 'abort'
  ) {
    throw error;
  }
}
finally {
  process.off('SIGINT', requestShutdown);
  process.off('SIGTERM', requestShutdown);

  shutdown.abort();
  sdk.close();
}
```

## Bidirectional Market Data поток

Bidirectional RPC принимает async request source, совместимый с generated `MarketDataRequest`. Если initial requests конечны, source может завершиться сразу после `yield`, а response stream продолжит работать до отмены или закрытия provider-ом:

```ts
import {
  SubscriptionAction,
  SubscriptionInterval,
  TInvestNodeSDK
} from '@woodger/t-invest-node-sdk';

async function* initialRequests() {
  yield {
    subscribeCandlesRequest: {
      subscriptionAction:
        SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
      instruments: [
        {
          instrumentId: 'BBG00QPYJ5H0',
          interval:
            SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE
        }
      ],
      waitingClose: false
    }
  };
}

export async function runMarketDataStream(
  sdk: TInvestNodeSDK,
  signal: AbortSignal
): Promise<void> {
  const responses = sdk.marketdataStream.marketDataStream(
    initialRequests(),
    {
      signal
    }
  );

  for await (const response of responses) {
    console.log(response);
  }
}
```

Создавайте и освобождайте `sdk` и `signal` так же, как в полном server-side примере выше. Динамический request source, который продолжает работать после initial subscription, тоже должен следить за signal, останавливать producers и удалять event listeners.

## Восстановление после разрыва

[Отдельный пример восстановления рыночного стрима](./market-data-recovery.md) показывает повторную подписку, догрузку закрытых минутных свечей и checkpoint после записи. Политика восстановления принадлежит Consumer-у; SDK передаёт ошибки и не запускает скрытый retry.

## Порядок завершения

Для долгоживущей операции владелец lifecycle должен:

1. отменить signal, переданный stream RPC;
2. дождаться завершения pending read и обработки ожидаемой отмены;
3. освободить application-owned producers и process listeners;
4. вызвать `sdk.close()`.

`sdk.close()` идемпотентен, но не ждёт stream, уже переданный transport-у. Сначала отмените pending read своим signal, а затем закрывайте channel.

Stream calls не проходят через `TInvestUnaryLimiter`. Ограничения stream connections и subscriptions описаны в [лимитной политике](../limits-policy.md), а готовый CLI lifecycle — в [справочнике потокового CLI](../cli-stream-reference.md).
