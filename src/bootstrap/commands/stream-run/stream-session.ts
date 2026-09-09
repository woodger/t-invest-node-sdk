/**
 * Модуль управляет lifecycle одной stream-сессии.
 *
 * Здесь допустимы выбор stream method, session-owned AbortController,
 * ограничения по времени/числу событий и гарантированное закрытие SDK.
 *
 * Здесь не должно быть чтения config, CLI option schema или JSONL mapping.
 */

import type { TInvestCallOptions } from '../../../application/dto/t-invest-services';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  MarketDataRequest,
  MarketDataResponse,
  MarketDataServerSideStreamRequest
} from '../../../generated/marketdata';
import type {
  PortfolioStreamRequest,
  PortfolioStreamResponse,
  PositionsStreamRequest,
  PositionsStreamResponse
} from '../../../generated/operations';
import type {
  TradesStreamRequest,
  TradesStreamResponse
} from '../../../generated/orders';
import type {
  StreamRunConfig,
  StreamRunRuntime,
  StreamRunStreamName
} from './config';
import {
  createMarketDataServerSideStreamRequest,
  createMarketDataStreamRequests,
  createPortfolioStreamRequest,
  createPositionsStreamRequest,
  createTradesStreamRequest
} from './request.mapper';
import {
  formatStreamRunResponse,
  type StreamRunResponse
} from './reporter';

export type StreamRunSdk = {
  marketdataStream: {
    marketDataStream(
      request: AsyncIterable<MarketDataRequest>,
      options?: TInvestCallOptions
    ): AsyncIterable<MarketDataResponse>;
    marketDataServerSideStream(
      request: MarketDataServerSideStreamRequest,
      options?: TInvestCallOptions
    ): AsyncIterable<MarketDataResponse>;
  };
  operationsStream: {
    portfolioStream(
      request: PortfolioStreamRequest,
      options?: TInvestCallOptions
    ): AsyncIterable<PortfolioStreamResponse>;
    positionsStream(
      request: PositionsStreamRequest,
      options?: TInvestCallOptions
    ): AsyncIterable<PositionsStreamResponse>;
  };
  ordersStream: {
    tradesStream(
      request: TradesStreamRequest,
      options?: TInvestCallOptions
    ): AsyncIterable<TradesStreamResponse>;
  };
  close(): void;
};

export type StreamRunSdkFactory = (options: TInvestOptions) => StreamRunSdk;
export type StreamRunClock = () => Date;
export type StreamRunElapsedClock = () => number;

export interface StreamRunSessionDependencies {
  readonly createSdk: StreamRunSdkFactory;
  readonly now: StreamRunClock;
  readonly elapsedNow: StreamRunElapsedClock;
}

const maxTimerDelayMs = 2_147_483_647;
const streamReadTimedOut = Symbol('streamReadTimedOut');

export function runStreamRunSession(
  config: StreamRunConfig,
  runtime: StreamRunRuntime,
  sdkOptions: TInvestOptions,
  dependencies: StreamRunSessionDependencies
): AsyncIterable<string> {
  return (async function* streamRunSession() {
    const sdk = dependencies.createSdk(sdkOptions);
    const controller = new AbortController();

    try {
      const responses = createStreamResponses(
        config,
        sdk,
        controller.signal
      );

      yield* formatStreamRunResponses(
        config.stream,
        responses,
        runtime,
        dependencies.now,
        dependencies.elapsedNow,
        () => {
          controller.abort();
        }
      );
    }
    finally {
      controller.abort();
      sdk.close();
    }
  })();
}

function createStreamResponses(
  config: StreamRunConfig,
  sdk: StreamRunSdk,
  signal: AbortSignal
): AsyncIterable<StreamRunResponse> {
  const callOptions: TInvestCallOptions = {
    signal
  };

  switch (config.stream) {
    case 'marketdata.marketDataStream':
      return sdk.marketdataStream.marketDataStream(
        createInitialMarketDataRequestStream(createMarketDataStreamRequests(config)),
        callOptions
      );

    case 'marketdata.marketDataServerSideStream':
      return sdk.marketdataStream.marketDataServerSideStream(
        createMarketDataServerSideStreamRequest(config),
        callOptions
      );

    case 'operations.portfolioStream':
      return sdk.operationsStream.portfolioStream(
        createPortfolioStreamRequest(config),
        callOptions
      );

    case 'operations.positionsStream':
      return sdk.operationsStream.positionsStream(
        createPositionsStreamRequest(config),
        callOptions
      );

    case 'orders.tradesStream':
      return sdk.ordersStream.tradesStream(
        createTradesStreamRequest(config),
        callOptions
      );
  }
}

async function* createInitialMarketDataRequestStream(
  requests: readonly MarketDataRequest[]
): AsyncIterable<MarketDataRequest> {
  for (const request of requests) {
    yield request;
  }
}

async function* formatStreamRunResponses(
  stream: StreamRunStreamName,
  responses: AsyncIterable<StreamRunResponse>,
  runtime: StreamRunRuntime,
  now: StreamRunClock,
  elapsedNow: StreamRunElapsedClock,
  cancelStream: () => void
): AsyncIterable<string> {
  const iterator = responses[Symbol.asyncIterator]();
  const startedAt = elapsedNow();
  let lastResponseAt = startedAt;
  let sequence = 1;
  let emittedEvents = 0;
  let pendingRead: Promise<IteratorResult<StreamRunResponse>> | undefined;

  try {
    while (true) {
      const timeoutMs = resolveNextTimeoutMs(
        startedAt,
        lastResponseAt,
        runtime,
        elapsedNow
      );

      if (timeoutMs !== undefined && timeoutMs <= 0) {
        break;
      }

      pendingRead = iterator.next();

      const result = await readNextWithTimeout(
        pendingRead,
        timeoutMs,
        elapsedNow
      );

      if (result === streamReadTimedOut) {
        cancelStream();
        await settleCancelledRead(pendingRead);
        pendingRead = undefined;

        break;
      }

      pendingRead = undefined;

      if (result.done) {
        break;
      }

      lastResponseAt = elapsedNow();

      const line = formatStreamRunResponse(result.value, {
        stream,
        sequence,
        receivedAt: now().toISOString(),
        includePings: runtime.includePings,
        includeSubscriptionEvents: runtime.includeSubscriptionEvents,
        raw: runtime.raw
      });

      if (line === undefined) {
        continue;
      }

      yield line;
      sequence += 1;
      emittedEvents += 1;

      if (runtime.maxEvents !== undefined && emittedEvents >= runtime.maxEvents) {
        break;
      }
    }
  }
  finally {
    cancelStream();

    if (pendingRead !== undefined) {
      await settleCancelledRead(pendingRead);
    }

    await iterator.return?.();
  }
}

function resolveNextTimeoutMs(
  startedAt: number,
  lastResponseAt: number,
  runtime: StreamRunRuntime,
  elapsedNow: StreamRunElapsedClock
): number | undefined {
  const now = elapsedNow();
  const remainingTimeouts = [
    runtime.durationMs === undefined ? undefined : runtime.durationMs - (now - startedAt),
    runtime.idleTimeoutMs === undefined ? undefined : runtime.idleTimeoutMs - (now - lastResponseAt)
  ].filter((value): value is number => value !== undefined);

  if (remainingTimeouts.length === 0) {
    return undefined;
  }

  return Math.min(...remainingTimeouts);
}

async function readNextWithTimeout<T>(
  next: Promise<IteratorResult<T>>,
  timeoutMs: number | undefined,
  elapsedNow: StreamRunElapsedClock
): Promise<IteratorResult<T> | typeof streamReadTimedOut> {
  if (timeoutMs === undefined) {
    return next;
  }

  const deadline = elapsedNow() + timeoutMs;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<typeof streamReadTimedOut>((resolve) => {
    const schedule = () => {
      const remaining = deadline - elapsedNow();

      if (remaining <= 0) {
        resolve(streamReadTimedOut);

        return;
      }

      timeout = setTimeout(schedule, Math.min(remaining, maxTimerDelayMs));
    };

    schedule();
  });

  try {
    return await Promise.race([next, timedOut]);
  }
  finally {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  }
}

async function settleCancelledRead<T>(
  read: Promise<IteratorResult<T>>
): Promise<void> {
  try {
    await read;
  }
  catch {
    // Основной результат чтения уже определён до cleanup; ошибка после отмены
    // сессии не должна подменять timeout или ранее полученную provider error.
  }
}
