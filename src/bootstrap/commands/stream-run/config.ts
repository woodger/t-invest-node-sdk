import {
  SubscriptionAction,
  SubscriptionInterval,
  type MarketDataServerSideStreamRequest
} from '../../../generated/marketdata';
import type {
  PortfolioStreamRequest,
  PositionsStreamRequest
} from '../../../generated/operations';
import type { TradesStreamRequest } from '../../../generated/orders';

export const streamRunStreamNames = [
  'marketdata.marketDataStream',
  'marketdata.marketDataServerSideStream',
  'operations.portfolioStream',
  'operations.positionsStream',
  'orders.tradesStream'
] as const;

export type StreamRunStreamName = typeof streamRunStreamNames[number];
export type SupportedStreamRunStreamName = Exclude<
  StreamRunStreamName,
  'marketdata.marketDataStream'
>;

export type StreamRunRuntime = {
  format: 'jsonl';
  maxEvents?: number;
  durationMs?: number;
  idleTimeoutMs?: number;
  includePings: boolean;
  includeSubscriptionEvents: boolean;
  raw: boolean;
};

export type StreamRunConfig = {
  stream: SupportedStreamRunStreamName;
  accounts?: string[];
  subscriptions?: MarketDataSubscriptions;
  runtime: StreamRunRuntime;
};

type MarketDataSubscriptions = {
  candles?: CandleSubscriptionConfig[];
  orderBooks?: OrderBookSubscriptionConfig[];
  trades?: InstrumentSubscriptionConfig[];
  info?: InstrumentSubscriptionConfig[];
  lastPrices?: InstrumentSubscriptionConfig[];
};

type CandleSubscriptionConfig = InstrumentSubscriptionConfig & {
  interval: SubscriptionInterval;
  waitingClose: boolean;
};

type OrderBookSubscriptionConfig = InstrumentSubscriptionConfig & {
  depth: number;
};

type InstrumentSubscriptionConfig = {
  instrumentId: string;
};

const supportedStreamRunStreamNames = streamRunStreamNames.filter(
  (name) => name !== 'marketdata.marketDataStream'
) as SupportedStreamRunStreamName[];

const streamRunStreamNameSet = new Set<string>(streamRunStreamNames);
const supportedStreamRunStreamNameSet = new Set<string>(supportedStreamRunStreamNames);

const allowedTopLevelFields = new Set([
  'stream',
  'subscriptions',
  'accounts',
  'runtime',
  'rawRequests'
]);

const allowedRuntimeFields = new Set([
  'format',
  'maxEvents',
  'durationMs',
  'idleTimeoutMs',
  'includePings',
  'includeSubscriptionEvents',
  'raw'
]);

const allowedSubscriptionFields = new Set([
  'candles',
  'orderBooks',
  'trades',
  'info',
  'lastPrices'
]);

const candleIntervalAliases = {
  '1min': SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
  '5min': SubscriptionInterval.SUBSCRIPTION_INTERVAL_FIVE_MINUTES
} as const;

export function parseStreamRunConfig(json: string): StreamRunConfig {
  let value: unknown;

  try {
    value = JSON.parse(json);
  }
  catch {
    throw new Error('Expected stream config as JSON object');
  }

  const config = requireObject(value, 'stream config');
  rejectUnknownFields(config, allowedTopLevelFields, 'stream config');

  const stream = parseStreamName(config.stream);
  const runtime = parseRuntime(config.runtime);

  if (stream === 'marketdata.marketDataServerSideStream') {
    assertAbsent(config.accounts, "Expected 'accounts' to be omitted for marketdata stream config");
    assertAbsent(config.rawRequests, "Expected 'rawRequests' to be omitted for marketdata server-side stream config");

    return {
      stream,
      subscriptions: parseMarketDataSubscriptions(config.subscriptions),
      runtime
    };
  }

  assertAbsent(config.subscriptions, `Expected 'subscriptions' to be omitted for ${stream} config`);
  assertAbsent(config.rawRequests, `Expected 'rawRequests' to be omitted for ${stream} config`);

  return {
    stream,
    accounts: parseAccountIds(config.accounts, stream),
    runtime
  };
}

export function createMarketDataServerSideStreamRequest(
  config: StreamRunConfig
): MarketDataServerSideStreamRequest {
  if (config.stream !== 'marketdata.marketDataServerSideStream') {
    throw new Error(`Expected marketdata server-side stream config, got '${config.stream}'`);
  }

  const subscriptions = config.subscriptions;

  if (!subscriptions) {
    throw new Error("Expected 'subscriptions' for marketdata server-side stream config");
  }

  const candles = subscriptions.candles ?? [];
  const orderBooks = subscriptions.orderBooks ?? [];
  const trades = subscriptions.trades ?? [];
  const info = subscriptions.info ?? [];
  const lastPrices = subscriptions.lastPrices ?? [];

  return {
    subscribeCandlesRequest: candles.length > 0
      ? {
        subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
        instruments: candles.map((item) => ({
          figi: '',
          interval: item.interval,
          instrumentId: item.instrumentId
        })),
        waitingClose: resolveCandlesWaitingClose(candles)
      }
      : undefined,
    subscribeOrderBookRequest: orderBooks.length > 0
      ? {
        subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
        instruments: orderBooks.map((item) => ({
          figi: '',
          depth: item.depth,
          instrumentId: item.instrumentId
        }))
      }
      : undefined,
    subscribeTradesRequest: trades.length > 0
      ? {
        subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
        instruments: trades.map(createInstrumentRequest)
      }
      : undefined,
    subscribeInfoRequest: info.length > 0
      ? {
        subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
        instruments: info.map(createInstrumentRequest)
      }
      : undefined,
    subscribeLastPriceRequest: lastPrices.length > 0
      ? {
        subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
        instruments: lastPrices.map(createInstrumentRequest)
      }
      : undefined
  };
}

export function createAccountStreamRequest(
  config: StreamRunConfig
): PortfolioStreamRequest | PositionsStreamRequest | TradesStreamRequest {
  if (
    config.stream !== 'operations.portfolioStream'
    && config.stream !== 'operations.positionsStream'
    && config.stream !== 'orders.tradesStream'
  ) {
    throw new Error(`Expected account stream config, got '${config.stream}'`);
  }

  return {
    accounts: config.accounts ?? []
  };
}

function parseStreamName(value: unknown): SupportedStreamRunStreamName {
  if (typeof value !== 'string') {
    throw new Error("Expected 'stream' as string");
  }

  if (!streamRunStreamNameSet.has(value)) {
    throw new Error(`Expected 'stream' as one of: ${streamRunStreamNames.join(', ')}`);
  }

  if (!supportedStreamRunStreamNameSet.has(value)) {
    throw new Error("Stream 'marketdata.marketDataStream' is not supported by stream run yet");
  }

  return value as SupportedStreamRunStreamName;
}

function parseRuntime(value: unknown): StreamRunRuntime {
  if (value === undefined) {
    return createDefaultRuntime();
  }

  const runtime = requireObject(value, 'runtime');
  rejectUnknownFields(runtime, allowedRuntimeFields, 'runtime');

  return {
    format: parseRuntimeFormat(runtime.format),
    maxEvents: parseOptionalPositiveInteger(runtime.maxEvents, 'runtime.maxEvents'),
    durationMs: parseOptionalPositiveInteger(runtime.durationMs, 'runtime.durationMs'),
    idleTimeoutMs: parseOptionalPositiveInteger(runtime.idleTimeoutMs, 'runtime.idleTimeoutMs'),
    includePings: parseOptionalBoolean(runtime.includePings, 'runtime.includePings') ?? false,
    includeSubscriptionEvents: parseOptionalBoolean(
      runtime.includeSubscriptionEvents,
      'runtime.includeSubscriptionEvents'
    ) ?? true,
    raw: parseOptionalBoolean(runtime.raw, 'runtime.raw') ?? false
  };
}

function createDefaultRuntime(): StreamRunRuntime {
  return {
    format: 'jsonl',
    includePings: false,
    includeSubscriptionEvents: true,
    raw: false
  };
}

function parseRuntimeFormat(value: unknown): 'jsonl' {
  if (value === undefined || value === 'jsonl') {
    return 'jsonl';
  }

  throw new Error("Expected 'runtime.format' as one of: jsonl");
}

function parseMarketDataSubscriptions(value: unknown): MarketDataSubscriptions {
  const subscriptions = requireObject(value, 'subscriptions');
  rejectUnknownFields(subscriptions, allowedSubscriptionFields, 'subscriptions');

  const result = {
    candles: parseOptionalArray(subscriptions.candles, 'subscriptions.candles')
      ?.map(parseCandleSubscription),
    orderBooks: parseOptionalArray(subscriptions.orderBooks, 'subscriptions.orderBooks')
      ?.map(parseOrderBookSubscription),
    trades: parseOptionalArray(subscriptions.trades, 'subscriptions.trades')
      ?.map((item) => parseInstrumentSubscription(item, 'subscriptions.trades[]')),
    info: parseOptionalArray(subscriptions.info, 'subscriptions.info')
      ?.map((item) => parseInstrumentSubscription(item, 'subscriptions.info[]')),
    lastPrices: parseOptionalArray(subscriptions.lastPrices, 'subscriptions.lastPrices')
      ?.map((item) => parseInstrumentSubscription(item, 'subscriptions.lastPrices[]'))
  };

  const hasSubscriptions = Object.values(result).some((items) => (items?.length ?? 0) > 0);

  if (!hasSubscriptions) {
    throw new Error("Expected 'subscriptions' to contain at least one market data subscription");
  }

  if (result.candles !== undefined) {
    validateCandlesWaitingClose(result.candles);
  }

  return result;
}

function parseCandleSubscription(value: unknown): CandleSubscriptionConfig {
  const candle = requireObject(value, 'subscriptions.candles[]');
  rejectUnknownFields(
    candle,
    new Set(['instrumentId', 'interval', 'waitingClose']),
    'subscriptions.candles[]'
  );

  return {
    instrumentId: parseInstrumentId(candle.instrumentId, 'subscriptions.candles[].instrumentId'),
    interval: parseCandleInterval(candle.interval),
    waitingClose: parseOptionalBoolean(
      candle.waitingClose,
      'subscriptions.candles[].waitingClose'
    ) ?? false
  };
}

function parseOrderBookSubscription(value: unknown): OrderBookSubscriptionConfig {
  const orderBook = requireObject(value, 'subscriptions.orderBooks[]');
  rejectUnknownFields(
    orderBook,
    new Set(['instrumentId', 'depth']),
    'subscriptions.orderBooks[]'
  );

  return {
    instrumentId: parseInstrumentId(orderBook.instrumentId, 'subscriptions.orderBooks[].instrumentId'),
    depth: parsePositiveInteger(orderBook.depth, 'subscriptions.orderBooks[].depth')
  };
}

function parseInstrumentSubscription(
  value: unknown,
  path: string
): InstrumentSubscriptionConfig {
  const instrument = requireObject(value, path);
  rejectUnknownFields(instrument, new Set(['instrumentId']), path);

  return {
    instrumentId: parseInstrumentId(instrument.instrumentId, `${path}.instrumentId`)
  };
}

function parseCandleInterval(value: unknown): SubscriptionInterval {
  if (typeof value !== 'string') {
    throw new Error("Expected 'subscriptions.candles[].interval' as string");
  }

  if (!(value in candleIntervalAliases)) {
    throw new Error("Expected 'subscriptions.candles[].interval' as one of: 1min, 5min");
  }

  return candleIntervalAliases[value as keyof typeof candleIntervalAliases];
}

function parseAccountIds(value: unknown, stream: string): string[] {
  const accounts = parseArray(value, 'accounts').map((item) => parseInstrumentId(item, 'accounts[]'));

  if (accounts.length === 0) {
    throw new Error(`Expected 'accounts' to contain at least one account id for ${stream}`);
  }

  return accounts;
}

function parseInstrumentId(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Expected '${path}' as non-empty string`);
  }

  return value;
}

function parseOptionalBoolean(value: unknown, path: string): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'boolean') {
    throw new Error(`Expected '${path}' as boolean`);
  }

  return value;
}

function parseOptionalPositiveInteger(value: unknown, path: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return parsePositiveInteger(value, path);
}

function parsePositiveInteger(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`Expected '${path}' as positive integer`);
  }

  return value;
}

function parseOptionalArray(value: unknown, path: string): unknown[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return parseArray(value, path);
}

function parseArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Expected '${path}' as array`);
  }

  return value;
}

function requireObject(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Expected '${path}' as object`);
  }

  return value as Record<string, unknown>;
}

function rejectUnknownFields(
  value: Record<string, unknown>,
  allowedFields: Set<string>,
  path: string
): void {
  for (const field of Object.keys(value)) {
    if (!allowedFields.has(field)) {
      throw new Error(`Unexpected '${path}.${field}'`);
    }
  }
}

function assertAbsent(value: unknown, message: string): void {
  if (value !== undefined) {
    throw new Error(message);
  }
}

function resolveCandlesWaitingClose(candles: CandleSubscriptionConfig[]): boolean {
  validateCandlesWaitingClose(candles);

  return candles[0]?.waitingClose ?? false;
}

function validateCandlesWaitingClose(candles: CandleSubscriptionConfig[]): void {
  const waitingClose = candles[0]?.waitingClose ?? false;

  if (candles.some((item) => item.waitingClose !== waitingClose)) {
    throw new Error("Expected 'subscriptions.candles[].waitingClose' to be the same for one request");
  }
}

function createInstrumentRequest(item: InstrumentSubscriptionConfig) {
  return {
    figi: '',
    instrumentId: item.instrumentId
  };
}
