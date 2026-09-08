# Потоки и отмена

> Type: Guide. Руководство показывает владение долгоживущим stream lifecycle, application-owned `AbortSignal` и порядок остановки transport call перед закрытием SDK.

## Server-side поток

Процесс устанавливает обработчики сигналов, передает один `AbortSignal` в stream RPC и считает локальную отмену штатным завершением. Provider failure не маскируется.

```ts
import {
  isSdkError,
  SdkErrorCode,
  SubscriptionAction,
  SubscriptionInterval,
  TInvestNodeSDK
} from '@woodger/t-invest-node-sdk';

type RequiredEnvironmentVariable =
  | 'T_INVEST_TOKEN'
  | 'T_INVEST_ENDPOINT';

function requireEnvironment(name: RequiredEnvironmentVariable): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
}

function isExpectedCancellation(
  error: unknown,
  signal: AbortSignal
): boolean {
  return signal.aborted
    && isSdkError(error, SdkErrorCode.Cancelled)
    && error.source === 'abort';
}

async function main(): Promise<void> {
  const sdk = new TInvestNodeSDK({
    token: requireEnvironment('T_INVEST_TOKEN'),
    endpoint: requireEnvironment('T_INVEST_ENDPOINT')
  });
  const shutdown = new AbortController();
  const requestShutdown = () => {
    shutdown.abort(new Error('Process shutdown requested'));
  };

  process.once('SIGINT', requestShutdown);
  process.once('SIGTERM', requestShutdown);

  try {
    const responses =
      sdk.marketdataStream.marketDataServerSideStream(
        {
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
        },
        {
          signal: shutdown.signal
        }
      );

    try {
      for await (const response of responses) {
        if (response.candle) {
          console.log(response.candle);
        }
      }
    }
    catch (error: unknown) {
      if (!isExpectedCancellation(error, shutdown.signal)) {
        throw error;
      }
    }
  }
  finally {
    process.off('SIGINT', requestShutdown);
    process.off('SIGTERM', requestShutdown);

    shutdown.abort(new Error('Stream scope disposed'));
    sdk.close();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
```

## Bidirectional Market Data поток

Bidirectional RPC получает async request source, совместимый с generated `MarketDataRequest`. Для конечного набора initial requests source может завершиться сразу после `yield`, а response stream продолжит работать до отмены или закрытия provider-ом:

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

Здесь `sdk` и переданный `signal` создаются и освобождаются так же, как в полном server-side примере выше. Если request source динамический и не заканчивается после initial subscription, он также должен наблюдать signal, останавливать producers и удалять event listeners.

## Порядок завершения

Для долгоживущей операции владелец lifecycle должен:

1. отменить signal, переданный stream RPC;
2. дождаться завершения pending read и обработки ожидаемой отмены;
3. освободить application-owned producers и process listeners;
4. вызвать `sdk.close()`.

`sdk.close()` идемпотентен, но не является graceful shutdown barrier для уже переданного transport-у stream. Закрытие channel без собственной отмены не заменяет управление pending read.

`TInvestUnaryLimiter` к stream calls не применяется. Ограничения stream connections и subscriptions описаны в [лимитной политике](../limits-policy.md). Готовая CLI lifecycle-модель описана в [справочнике потокового CLI](../cli-stream-reference.md).
