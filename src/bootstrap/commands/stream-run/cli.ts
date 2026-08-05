/**
 * Модуль CLI-команды `stream run` запускает configured stream session.
 *
 * Здесь допустимы:
 * - чтение stream config и применение runtime overrides;
 * - выбор generated stream method через SDK facade;
 * - управление lifecycle долгоживущего stream-процесса;
 *
 * Здесь не должно быть JSONL event formatting rules или transport adapter logic.
 */

import {
  readFile } from 'node:fs/promises';
import type {
  TInvestCallOptions
} from '../../../application/dto/t-invest-services';
import type {
  TInvestOptions
} from '../../../application/dto/t-invest-options';
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
import type { InferOptions, InferProvidedOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  createMarketDataStreamRequests,
  createMarketDataServerSideStreamRequest,
  createPortfolioStreamRequest,
  createPositionsStreamRequest,
  createTradesStreamRequest,
  parseStreamRunConfig,
  type StreamRunConfig,
  type StreamRunRuntime,
  type SupportedStreamRunStreamName
} from './config';
import {
  formatStreamRunResponse,
  streamRunFormats,
  type StreamRunResponse
} from './reporter';

type StreamRunSdk = {
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

type StreamRunSdkFactory = (options: TInvestOptions) => StreamRunSdk;
type StreamRunConfigReader = (path: string) => Promise<string>;
type StreamRunClock = () => Date;

type StreamRunDependencies = {
  createSdk?: StreamRunSdkFactory;
  readConfig?: StreamRunConfigReader;
  now?: StreamRunClock;
};

const streamRunCommandPath = ['stream', 'run'] as const;
const defaultStreamRunSdkFactory: StreamRunSdkFactory = (options) => new TInvestNodeSDK(options);
const defaultStreamRunConfigReader: StreamRunConfigReader = (path) => readFile(path, 'utf8');

const streamRunOptionsSchema = withSdkOptions({
  config: {
    type: 'string',
    required: true
  },
  'max-events': {
    type: 'number',
    integer: true,
    min: 1
  },
  'duration-ms': {
    type: 'number',
    integer: true,
    min: 1
  },
  'idle-timeout-ms': {
    type: 'number',
    integer: true,
    min: 1
  },
  'include-pings': {
    type: 'boolean'
  },
  raw: {
    type: 'boolean'
  },
  format: {
    type: 'string',
    choices: streamRunFormats,
    default: 'jsonl'
  }
} as const);

type StreamRunOptions = InferOptions<typeof streamRunOptionsSchema>;
type StreamRunProvidedOptions = InferProvidedOptions<typeof streamRunOptionsSchema>;

export function createStreamRunCommand(
  dependencies: StreamRunDependencies = {}
) {
  const createSdk = dependencies.createSdk ?? defaultStreamRunSdkFactory;
  const readConfig = dependencies.readConfig ?? defaultStreamRunConfigReader;
  const now = dependencies.now ?? (() => new Date());

  return command.define({
    path: streamRunCommandPath,
    options: streamRunOptionsSchema,
    async handle({ options, provided }) {
      return createStreamRunOutput(options, provided, {
        createSdk,
        readConfig,
        now
      });
    }
  });
}

export const streamRunCommand = createStreamRunCommand();

async function createStreamRunOutput(
  options: StreamRunOptions,
  provided: StreamRunProvidedOptions,
  dependencies: Required<StreamRunDependencies>
): Promise<AsyncIterable<string>> {
  const config = parseStreamRunConfig(await dependencies.readConfig(options.config));
  const runtime = resolveStreamRunRuntime(config.runtime, options, provided);
  const sdkOptions = resolveSdkOptionsFromCommandOptions(options);

  return runStreamRunSession(config, runtime, sdkOptions, dependencies);
}

function resolveStreamRunRuntime(
  runtime: StreamRunRuntime,
  options: StreamRunOptions,
  provided: StreamRunProvidedOptions
): StreamRunRuntime {
  return {
    ...runtime,
    format: options.format,
    maxEvents: options['max-events'] ?? runtime.maxEvents,
    durationMs: options['duration-ms'] ?? runtime.durationMs,
    idleTimeoutMs: options['idle-timeout-ms'] ?? runtime.idleTimeoutMs,
    includePings: provided['include-pings']
      ? options['include-pings'] === true
      : runtime.includePings,
    raw: provided.raw
      ? options.raw === true
      : runtime.raw
  };
}

function runStreamRunSession(
  config: StreamRunConfig,
  runtime: StreamRunRuntime,
  sdkOptions: TInvestOptions,
  dependencies: Required<StreamRunDependencies>
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
  stream: SupportedStreamRunStreamName,
  responses: AsyncIterable<StreamRunResponse>,
  runtime: StreamRunRuntime,
  now: StreamRunClock,
  cancelStream: () => void
): AsyncIterable<string> {
  const iterator = responses[Symbol.asyncIterator]();
  const startedAt = Date.now();
  let lastResponseAt = startedAt;
  let sequence = 1;
  let emittedEvents = 0;
  let pendingRead: Promise<IteratorResult<StreamRunResponse>> | undefined;

  try {
    while (true) {
      const timeoutMs = resolveNextTimeoutMs(startedAt, lastResponseAt, runtime);

      if (timeoutMs !== undefined && timeoutMs <= 0) {
        break;
      }

      pendingRead = iterator.next();

      const result = await readNextWithTimeout(pendingRead, timeoutMs);

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

      lastResponseAt = Date.now();

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
  runtime: StreamRunRuntime
): number | undefined {
  const now = Date.now();
  const remainingTimeouts = [
    runtime.durationMs === undefined ? undefined : runtime.durationMs - (now - startedAt),
    runtime.idleTimeoutMs === undefined ? undefined : runtime.idleTimeoutMs - (now - lastResponseAt)
  ].filter((value): value is number => value !== undefined);

  if (remainingTimeouts.length === 0) {
    return undefined;
  }

  return Math.min(...remainingTimeouts);
}

const streamReadTimedOut = Symbol('streamReadTimedOut');

async function readNextWithTimeout<T>(
  next: Promise<IteratorResult<T>>,
  timeoutMs: number | undefined
): Promise<IteratorResult<T> | typeof streamReadTimedOut> {
  if (timeoutMs === undefined) {
    return next;
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<typeof streamReadTimedOut>((resolve) => {
    timeout = setTimeout(() => resolve(streamReadTimedOut), timeoutMs);
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
    // Основной read outcome уже определен до cleanup; ошибка после session
    // cancellation не должна подменять timeout или ранее полученную ошибку.
  }
}
