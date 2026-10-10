# Восстановление рыночного стрима

> Type: Guide. Здесь показано, как приложение восстанавливает поток закрытых минутных биржевых свечей после разрыва соединения.

Переподключением управляет приложение. Пример использует публичные методы SDK; фасад SDK и `stream run` не повторяют подключения автоматически.

## Порядок восстановления

1. Открыть поток и получить успешное подтверждение подписки с `waitingClose: true`.
2. Через `GetCandles` прочитать историю от первой ещё не обработанной минуты до начала текущей минуты.
3. Использовать дальнейшие свечи из потока как уведомления о новых закрытых интервалах и догружать их через `GetCandles`.
4. Перед обработкой следующей свечи сохранить текущую свечу и checkpoint — позицию для продолжения чтения.
5. После `UNAVAILABLE` от транспорта или штатного завершения потока повторить подписку с ограниченной задержкой между попытками.

Сохраняемые данные всегда берутся из исторического метода с одним источником и интервалом. Подписка открывается до догрузки истории; уведомления, накопившиеся за время догрузки, читаются затем. Перекрытие запросов не приводит к повторной выдаче уже обработанных свечей. Незавершённые свечи не выдаются.

Пример восстанавливает свечную историю. Для сделок, стаканов и портфеля нужны собственные правила получения снимка данных и сверки состояния: поток не позволяет восстановить каждое биржевое событие по общей позиции чтения.

Исправления ранее опубликованной истории и задержки её появления требуют периодической сверки в приложении. Ограничения периодов `GetCandles` описаны в [официальной документации](https://developer.tbank.ru/invest/services/quotes/faq_marketdata/).

## Генератор закрытых свечей

`from` задаёт начало первой ещё не обработанной минуты по UTC. История читается окнами не больше суток с `limit: 2400`, что покрывает минутные свечи одного окна. Функцию из примера можно разместить в модуле `recover-closed-candles.ts` своего приложения.

```ts
import { setTimeout as delay } from 'node:timers/promises';
import {
  CandleInterval,
  CandleSource,
  GetCandlesRequest_CandleSource,
  isSdkError,
  SdkErrorCode,
  SubscriptionAction,
  SubscriptionInterval,
  SubscriptionStatus,
  type HistoricCandle,
  type TInvestNodeSDK
} from '@woodger/t-invest-node-sdk';

const minuteMs = 60_000;
const dayMs = 24 * 60 * minuteMs;

export async function* recoverClosedCandles(
  sdk: Pick<TInvestNodeSDK, 'marketData' | 'marketdataStream'>,
  instrumentUid: string,
  from: Date,
  signal: AbortSignal
): AsyncGenerator<HistoricCandle> {
  let nextMinute = from.getTime();
  let failures = 0;
  const maxRetries = 5;

  if (!Number.isFinite(nextMinute) || nextMinute % minuteMs !== 0) {
    throw new Error('from must identify a UTC minute boundary');
  }

  // Данные берём из истории; stream используется для уведомлений о догрузке.
  async function* readHistory(
    until: number,
    attemptSignal: AbortSignal
  ): AsyncGenerator<HistoricCandle> {
    let windowStart = nextMinute;

    while (windowStart < until) {
      attemptSignal.throwIfAborted();

      const windowEnd = Math.min(windowStart + dayMs, until);
      const { candles } = await sdk.marketData.getCandles({
        instrumentId: instrumentUid,
        from: new Date(windowStart),
        to: new Date(windowEnd),
        interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
        candleSourceType: GetCandlesRequest_CandleSource.CANDLE_SOURCE_EXCHANGE,
        limit: 2400
      }, { signal: attemptSignal });
      const ordered = candles.map((candle) => {
        const time = candle.time?.getTime();

        if (time === undefined || !Number.isFinite(time)
          || time % minuteMs !== 0 || time < windowStart || time > windowEnd
          || candle.candleSource !== CandleSource.CANDLE_SOURCE_EXCHANGE) {
          throw new Error('Unexpected historical candle');
        }

        return { candle, time };
      }).sort((a, b) => a.time - b.time);

      for (const { candle, time } of ordered) {
        attemptSignal.throwIfAborted();

        if (time < nextMinute || time >= until) {
          continue;
        }

        if (!candle.isComplete) {
          return;
        }

        yield candle;

        // Consumer может сохранить свечу до запроса следующей
        // и сдвига checkpoint.
        nextMinute = time + minuteMs;
        failures = 0;
      }

      windowStart = windowEnd;
    }
  }

  while (!signal.aborted) {
    const attempt = new AbortController();
    const attemptSignal = AbortSignal.any([signal, attempt.signal]);

    try {
      let subscribed = false;
      const responses = sdk.marketdataStream.marketDataServerSideStream({
        subscribeCandlesRequest: {
          subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
          instruments: [{
            instrumentId: instrumentUid,
            interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE
          }],
          waitingClose: true,
          candleSourceType: GetCandlesRequest_CandleSource.CANDLE_SOURCE_EXCHANGE
        }
      }, { signal: attemptSignal });

      for await (const response of responses) {
        attemptSignal.throwIfAborted();

        if (!subscribed && response.subscribeCandlesResponse) {
          const subscription = response.subscribeCandlesResponse.candlesSubscriptions.find(
            (item) => item.instrumentUid === instrumentUid
              && item.interval === SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE
          );

          if (subscription?.subscriptionStatus !== SubscriptionStatus.SUBSCRIPTION_STATUS_SUCCESS
            || !subscription.waitingClose) {
            throw new Error('Closed-candle subscription was rejected');
          }

          subscribed = true;

          // Активная подписка позволяет получать уведомления за время догрузки.
          yield* readHistory(Math.floor(Date.now() / minuteMs) * minuteMs, attemptSignal);
        }

        if (response.candle) {
          const candle = response.candle;
          const time = candle.time?.getTime();

          if (!subscribed || candle.instrumentUid !== instrumentUid
            || candle.interval !== SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE
            || time === undefined || !Number.isFinite(time) || time % minuteMs !== 0
            || candle.candleSourceType !== CandleSource.CANDLE_SOURCE_EXCHANGE) {
            throw new Error('Unexpected stream candle');
          }

          // Уведомление запускает чтение истории из того же источника данных.
          yield* readHistory(time + minuteMs, attemptSignal);
        }
      }
    }
    catch (error: unknown) {
      if (signal.aborted && (error === signal.reason
        || (isSdkError(error, SdkErrorCode.Cancelled) && error.source === 'abort'))) {
        return;
      }

      if (!isSdkError(error, SdkErrorCode.Unavailable)
        || error.source !== 'grpc' || failures >= maxRetries) {
        throw error;
      }
    }
    finally {
      // Завершаем текущую попытку перед backoff и новой подпиской.
      attempt.abort();
    }

    if (signal.aborted) {
      return;
    }

    if (failures >= maxRetries) {
      throw new Error('Stream recovery attempts exhausted');
    }

    const backoffMs = Math.min(30_000, 1000 * 2 ** failures);

    failures += 1;

    try {
      await delay(backoffMs * (0.5 + Math.random() * 0.5), undefined, { signal });
    }
    catch (error: unknown) {
      if (!signal.aborted) {
        throw error;
      }

      return;
    }
  }
}
```

После пяти последовательных неудачных переподключений генератор завершается ошибкой. Успешная обработка новой свечи сбрасывает счётчик. Ошибки TLS, авторизации, квот, подписки, данных и локальной конфигурации передаются вызывающему коду сразу.

Ожидание перед повторной попыткой отменяется общим `AbortSignal`. Закрытие потока без ошибки тоже запускает переподключение; завершённая попытка отменяется до открытия следующей.

Вызов `GetCandles` на уведомление выбран намеренно: закрытая свеча в потоке может появиться раньше соответствующей записи в истории. Если история ещё не содержит завершённую свечу, checkpoint для неё не продвигается; следующее уведомление или переподключение повторит чтение. Если новых уведомлений долго нет, периодическую догрузку и проверку `ping` должно организовать приложение.

## Владение записью и shutdown

Демонстрация хранит данные и checkpoint в памяти. В приложении замените обновление `Map` и checkpoint одной транзакцией своего хранилища и загружайте checkpoint перед стартом. Ключ записи должен включать инструмент, интервал, источник и время свечи; повторная запись по тому же ключу должна быть безопасной.

```ts
import {
  createInMemoryUnaryLimiter,
  TInvestNodeSDK,
  type HistoricCandle
} from '@woodger/t-invest-node-sdk';
import { recoverClosedCandles } from './recover-closed-candles.js';

const instrumentUid = 'YOUR_INSTRUMENT_UID';
const sdk = new TInvestNodeSDK({
  token: 'YOUR_TOKEN',
  endpoint: 'invest-public-api.tbank.ru:443',
  unaryLimiter: createInMemoryUnaryLimiter()
});
const shutdown = new AbortController();
const requestShutdown = () => shutdown.abort();
const stored = new Map<string, HistoricCandle>();
let checkpoint = new Date(Math.floor(Date.now() / 60_000) * 60_000 - 3_600_000);

process.once('SIGINT', requestShutdown);
process.once('SIGTERM', requestShutdown);

try {
  for await (const candle of recoverClosedCandles(
    sdk, instrumentUid, checkpoint, shutdown.signal
  )) {
    const time = candle.time?.getTime();

    if (time === undefined) {
      throw new Error('Missing candle time');
    }

    const key = `${instrumentUid}:1min:exchange:${time}`;

    stored.set(key, candle);
    checkpoint = new Date(time + 60_000);
    console.log({ key, candle, nextMinute: checkpoint });
  }
}
finally {
  process.off('SIGINT', requestShutdown);
  process.off('SIGTERM', requestShutdown);

  shutdown.abort();
  sdk.close();
}
```

Генератор продвигает свой checkpoint после возобновления из `yield`. В показанном `for await` это происходит после записи. Если запись выбрасывает ошибку, цикл закрывает генератор, а текущая попытка отменяется. Ошибка записи передаётся вызывающему коду и не запускает повторное подключение. При повторном запуске используйте только checkpoint успешно сохранённых данных.

Для этого сценария нужен UID, который можно получить через `sdk.instruments`; пример не подменяет его FIGI. Замените `YOUR_TOKEN` и `YOUR_INSTRUMENT_UID` параметрами своего приложения.

Ограничитель подключён явно и регулирует только unary-догрузку. Он не координирует разные процессы и потоковые соединения. Эти границы описаны в [лимитной политике](../limits-policy.md).

Порядок отмены и освобождения ресурсов описан в [Потоках и отмене](./streams-and-cancellation.md), а классификация ошибок — в [Ошибках и lifecycle](./errors-and-lifecycle.md).

Для проверки сценария без брокера используйте [тестовые сервисы из публичных экспортов](./testing-with-service-definitions.md). Проверьте разрыв после подтверждения подписки, ошибку догрузки, повторные свечи, отказ подписки, исчерпание попыток и отмену во время ожидания перед переподключением.
