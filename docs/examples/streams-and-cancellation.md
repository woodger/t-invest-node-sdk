# Читать поток и завершать его

Используйте этот пример, когда приложению нужно читать события T-Invest до отмены, ошибки или закрытия провайдером. Приложение открывает поток, передаёт ему `AbortSignal` и освобождает свои обработчики после чтения. В итоге ожидаемая отмена завершается штатно, ошибка провайдера остаётся видимой, а SDK закрывается только после остановки потока.

## Открыть серверный поток

Пример устанавливает обработчики сигналов процесса, передаёт один `AbortSignal` в потоковый RPC и считает локальную отмену штатным завершением. Ошибка провайдера передаётся без маскировки.

`server-side-stream.ts`

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

// Один сигнал завершает чтение потока при остановке приложения.
const shutdown = new AbortController();
const requestShutdown = () => shutdown.abort();

process.once('SIGINT', requestShutdown);
process.once('SIGTERM', requestShutdown);

try {
  // Ожидание следующего ответа прерывается вместе с сигналом остановки.
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
        // Не ждём закрытия минутного интервала перед отправкой свечи.
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
  // Локальная отмена ожидаема; ошибки провайдера и транспорта передаём дальше.
  if (
    !shutdown.signal.aborted
    || !isSdkError(error, SdkErrorCode.Cancelled)
    || error.source !== 'abort'
  ) {
    throw error;
  }
}
finally {
  // Обработчики больше не нужны после завершения чтения.
  process.off('SIGINT', requestShutdown);
  process.off('SIGTERM', requestShutdown);

  // Сначала останавливаем поток, затем закрываем общий канал SDK.
  shutdown.abort();
  sdk.close();
}
```

## Открыть двусторонний поток Market Data

Двусторонний RPC принимает асинхронный источник запросов типа `MarketDataRequest`. Если начальный набор запросов конечен, источник может завершиться сразу после `yield`. Поток ответов продолжит работать до отмены или закрытия провайдером:

`bidirectional-stream.ts`

```ts
import {
  SubscriptionAction,
  SubscriptionInterval,
  TInvestNodeSDK
} from '@woodger/t-invest-node-sdk';

// Источник передаёт начальную подписку и завершается; поток ответов продолжает работать.
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
      // Не ждём закрытия минутного интервала перед отправкой свечи.
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

## Изменить подписку во время чтения

Источник запросов может оставаться активным и отправлять изменения подписки, пока приложение читает ответы. В примере он сначала подписывается на минутные свечи, а через десять секунд отправляет отписку в тот же RPC. Подтверждения подписки и отписки приходят в `subscribeCandlesResponse` и выводятся вместе с остальными ответами.

`subscription-changes.ts`

```ts
import { setTimeout as delay } from 'node:timers/promises';
import {
  SubscriptionAction,
  SubscriptionInterval,
  type TInvestNodeSDK
} from '@woodger/t-invest-node-sdk';

async function* subscriptionChanges(
  instrumentUid: string,
  signal: AbortSignal
) {
  const subscription = {
    instruments: [{
      instrumentId: instrumentUid,
      interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE
    }],
    waitingClose: true
  };
  const subscriptionDurationMs = 10_000;

  signal.throwIfAborted();

  yield {
    subscribeCandlesRequest: {
      ...subscription,
      subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE
    }
  };

  await delay(subscriptionDurationMs, undefined, { signal });

  yield {
    subscribeCandlesRequest: {
      ...subscription,
      subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_UNSUBSCRIBE
    }
  };
}

export async function runSubscriptionChanges(
  sdk: Pick<TInvestNodeSDK, 'marketdataStream'>,
  instrumentUid: string,
  signal: AbortSignal
): Promise<void> {
  const session = new AbortController();
  const sessionSignal = AbortSignal.any([signal, session.signal]);

  try {
    const responses = sdk.marketdataStream.marketDataStream(
      subscriptionChanges(instrumentUid, sessionSignal),
      { signal: sessionSignal }
    );

    for await (const response of responses) {
      console.log(response);
    }
  }
  finally {
    session.abort();
  }
}
```

Передайте функции UID из [примера поиска инструмента](./instrument-lookup.md). Создание SDK, обработку локальной отмены и закрытие канала выполняйте так же, как в первом примере этой страницы. Общий сигнал останавливает и RPC, и ожидание внутри источника запросов. Если чтение завершилось раньше, `finally` отменяет оставшееся ожидание.

Завершение источника после отписки не закрывает поток ответов. Он продолжает работать до отмены или закрытия провайдером. Для потоков состояний заявок используется другая подписка — она разобрана в [отдельном примере](./order-state-stream.md).

## Восстановить поток после разрыва

[Отдельный пример восстановления рыночного стрима](./market-data-recovery.md) показывает повторную подписку, догрузку закрытых минутных свечей и сохранение прогресса после записи. Восстановлением управляет приложение; SDK передаёт ошибки и не запускает скрытые повторные запросы.

## Завершить поток перед закрытием SDK

Код, управляющий долгоживущей операцией, должен:

1. отменить сигнал, переданный потоковому RPC;
2. дождаться завершения текущего чтения и обработки ожидаемой отмены;
3. остановить источники данных приложения и удалить обработчики сигналов процесса;
4. вызвать `sdk.close()`.

`sdk.close()` можно вызывать повторно, но он не ждёт завершения уже открытого потока. Сначала отмените текущее чтение своим сигналом, дождитесь завершения операции, а затем закрывайте канал.

Потоковые вызовы не проходят через `TInvestUnaryLimiter`. Ограничения потоковых соединений и подписок описаны в [лимитной политике](../limits-policy.md), а порядок работы CLI — в [справочнике потокового CLI](../cli-stream-reference.md).
