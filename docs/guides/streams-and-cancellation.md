# Потоки и отмена

> Type: Guide. Здесь показано, как подписаться на поток, отменить его через `AbortSignal` и завершить работу перед закрытием SDK.

## Server-side поток

Пример устанавливает обработчики сигналов процесса, передаёт один `AbortSignal` в потоковый RPC и считает локальную отмену штатным завершением. Ошибка провайдера передаётся без маскировки.

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

Двусторонний RPC принимает асинхронный источник запросов типа `MarketDataRequest`. Если начальный набор запросов конечен, источник может завершиться сразу после `yield`. Поток ответов продолжит работать до отмены или закрытия провайдером:

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

Создавайте и освобождайте `sdk` и `signal` так же, как в полном примере серверного потока выше. Если источник запросов продолжает работать после начальной подписки, он тоже должен учитывать сигнал отмены, останавливать формирование запросов и удалять обработчики событий.

## Восстановление после разрыва

[Отдельный пример восстановления рыночного стрима](./market-data-recovery.md) показывает повторную подписку, догрузку закрытых минутных свечей и сохранение прогресса после записи. Восстановлением управляет приложение; SDK передаёт ошибки и не запускает скрытые повторные запросы.

## Порядок завершения

Код, управляющий долгоживущей операцией, должен:

1. отменить сигнал, переданный потоковому RPC;
2. дождаться завершения текущего чтения и обработки ожидаемой отмены;
3. остановить источники данных приложения и удалить обработчики сигналов процесса;
4. вызвать `sdk.close()`.

`sdk.close()` можно вызывать повторно, но он не ждёт завершения уже открытого потока. Сначала отмените текущее чтение своим сигналом, дождитесь завершения операции, а затем закрывайте канал.

Потоковые вызовы не проходят через `TInvestUnaryLimiter`. Ограничения потоковых соединений и подписок описаны в [лимитной политике](../limits-policy.md), а порядок работы CLI — в [справочнике потокового CLI](../cli-stream-reference.md).
