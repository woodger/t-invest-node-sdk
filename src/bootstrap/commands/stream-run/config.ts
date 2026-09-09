/**
 * Модуль stream run config описывает JSON contract для stream sessions.
 *
 * Здесь допустимы:
 * - валидация stream config до создания SDK;
 * - mapping typed config в generated stream requests;
 * - runtime defaults для долгоживущих stream-команд;
 *
 * Здесь не должно быть SDK calls или stdout/stderr output logic.
 */

import {
  CandleInstrument,
  InfoInstrument,
  LastPriceInstrument,
  type MarketDataRequest,
  OrderBookType,
  OrderBookInstrument,
  SubscriptionAction,
  SubscriptionInterval,
  TradeSourceType,
  TradeInstrument
} from '../../../generated/marketdata';
import { CliUsageError } from 'icore';

export const streamRunStreamNames = [
  'marketdata.marketDataStream',
  'marketdata.marketDataServerSideStream',
  'operations.portfolioStream',
  'operations.positionsStream',
  'orders.tradesStream'
] as const;

export type StreamRunStreamName = typeof streamRunStreamNames[number];

export type StreamRunRuntime = {
  format: 'jsonl';
  maxEvents?: number | undefined;
  durationMs?: number | undefined;
  idleTimeoutMs?: number | undefined;
  includePings: boolean;
  includeSubscriptionEvents: boolean;
  raw: boolean;
};

export type StreamRunConfig = {
  stream: StreamRunStreamName;
  accounts?: string[];
  requests?: MarketDataRequest[];
  subscriptions?: MarketDataSubscriptions;
  runtime: StreamRunRuntime;
};

export type MarketDataSubscriptions = {
  candles?: CandleSubscriptionConfig[] | undefined;
  orderBooks?: OrderBookSubscriptionConfig[] | undefined;
  trades?: InstrumentSubscriptionConfig[] | undefined;
  info?: InstrumentSubscriptionConfig[] | undefined;
  lastPrices?: InstrumentSubscriptionConfig[] | undefined;
};

export type CandleSubscriptionConfig = InstrumentSubscriptionConfig & {
  interval: SubscriptionInterval;
  waitingClose: boolean;
};

export type OrderBookSubscriptionConfig = InstrumentSubscriptionConfig & {
  depth: number;
};

export type InstrumentSubscriptionConfig = {
  instrumentId: string;
};

const streamRunStreamNameSet = new Set<string>(streamRunStreamNames);

const allowedTopLevelFields = new Set([
  'stream',
  'requests',
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

const allowedMarketDataStreamRequestTypes = [
  'subscribeCandles',
  'subscribeOrderBook',
  'subscribeTrades',
  'subscribeInfo',
  'subscribeLastPrice',
  'getMySubscriptions'
] as const;

type MarketDataStreamRequestType = typeof allowedMarketDataStreamRequestTypes[number];

const allowedMarketDataStreamRequestTypeSet = new Set<string>(allowedMarketDataStreamRequestTypes);

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
    throw new CliUsageError('Expected stream config as JSON object');
  }

  const config = requireObject(value, 'stream config');
  rejectUnknownFields(config, allowedTopLevelFields, 'stream config');

  const stream = parseStreamName(config['stream']);
  const runtime = parseRuntime(config['runtime']);

  if (stream === 'marketdata.marketDataStream') {
    assertAbsent(config['accounts'], "Expected 'accounts' to be omitted for marketdata stream config");
    assertAbsent(config['subscriptions'], "Expected 'subscriptions' to be omitted for marketdata bidirectional stream config");
    assertAbsent(config['rawRequests'], "Expected 'rawRequests' to be omitted for marketdata bidirectional stream config");

    return {
      stream,
      requests: parseMarketDataStreamRequests(config['requests']),
      runtime
    };
  }

  if (stream === 'marketdata.marketDataServerSideStream') {
    assertAbsent(config['accounts'], "Expected 'accounts' to be omitted for marketdata stream config");
    assertAbsent(config['requests'], "Expected 'requests' to be omitted for marketdata server-side stream config");
    assertAbsent(config['rawRequests'], "Expected 'rawRequests' to be omitted for marketdata server-side stream config");

    return {
      stream,
      subscriptions: parseMarketDataSubscriptions(config['subscriptions']),
      runtime
    };
  }

  assertAbsent(config['subscriptions'], `Expected 'subscriptions' to be omitted for ${stream} config`);
  assertAbsent(config['requests'], `Expected 'requests' to be omitted for ${stream} config`);
  assertAbsent(config['rawRequests'], `Expected 'rawRequests' to be omitted for ${stream} config`);

  return {
    stream,
    accounts: parseAccountIds(config['accounts'], stream),
    runtime
  };
}

function parseStreamName(value: unknown): StreamRunStreamName {
  if (typeof value !== 'string') {
    throw new CliUsageError("Expected 'stream' as string");
  }

  if (!streamRunStreamNameSet.has(value)) {
    throw new CliUsageError(`Expected 'stream' as one of: ${streamRunStreamNames.join(', ')}`);
  }

  return value as StreamRunStreamName;
}

function parseRuntime(value: unknown): StreamRunRuntime {
  if (value === undefined) {
    return createDefaultRuntime();
  }

  const runtime = requireObject(value, 'runtime');
  rejectUnknownFields(runtime, allowedRuntimeFields, 'runtime');

  return {
    format: parseRuntimeFormat(runtime['format']),
    maxEvents: parseOptionalPositiveInteger(runtime['maxEvents'], 'runtime.maxEvents'),
    durationMs: parseOptionalPositiveInteger(runtime['durationMs'], 'runtime.durationMs'),
    idleTimeoutMs: parseOptionalPositiveInteger(runtime['idleTimeoutMs'], 'runtime.idleTimeoutMs'),
    includePings: parseOptionalBoolean(runtime['includePings'], 'runtime.includePings') ?? false,
    includeSubscriptionEvents: parseOptionalBoolean(
      runtime['includeSubscriptionEvents'],
      'runtime.includeSubscriptionEvents'
    ) ?? true,
    raw: parseOptionalBoolean(runtime['raw'], 'runtime.raw') ?? false
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

  throw new CliUsageError("Expected 'runtime.format' as one of: jsonl");
}

function parseMarketDataStreamRequests(value: unknown): MarketDataRequest[] {
  const requests = parseArray(value, 'requests').map(parseMarketDataStreamRequest);

  if (requests.length === 0) {
    throw new CliUsageError("Expected 'requests' to contain at least one market data stream request");
  }

  return requests;
}

function parseMarketDataStreamRequest(value: unknown): MarketDataRequest {
  const request = requireObject(value, 'requests[]');
  const requestType = parseMarketDataStreamRequestType(request['type']);

  switch (requestType) {
    case 'subscribeCandles': {
      rejectUnknownFields(request, new Set(['type', 'instruments']), 'requests[]');

      const instruments = parseArray(request['instruments'], 'requests[].instruments')
        .map((item) => parseCandleSubscription(item, 'requests[].instruments[]'));

      validateCandlesWaitingClose(instruments);

      return {
        subscribeCandlesRequest: {
          subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
          instruments: instruments.map((item) => CandleInstrument.create({
            interval: item.interval,
            instrumentId: item.instrumentId
          })),
          waitingClose: resolveCandlesWaitingClose(instruments)
        }
      };
    }

    case 'subscribeOrderBook':
      rejectUnknownFields(request, new Set(['type', 'instruments']), 'requests[]');

      return {
        subscribeOrderBookRequest: {
          subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
          instruments: parseArray(request['instruments'], 'requests[].instruments')
            .map((item) => parseOrderBookSubscription(item, 'requests[].instruments[]'))
            .map((item) => OrderBookInstrument.create({
              depth: item.depth,
              instrumentId: item.instrumentId,
              orderBookType: OrderBookType.ORDERBOOK_TYPE_UNSPECIFIED
            }))
        }
      };

    case 'subscribeTrades':
      rejectUnknownFields(request, new Set(['type', 'instruments']), 'requests[]');

      return {
        subscribeTradesRequest: {
          subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
          instruments: parseArray(request['instruments'], 'requests[].instruments')
            .map((item) => parseInstrumentSubscription(item, 'requests[].instruments[]'))
            .map((item) => TradeInstrument.create({
              instrumentId: item.instrumentId
            })),
          tradeSource: TradeSourceType.TRADE_SOURCE_UNSPECIFIED,
          withOpenInterest: false
        }
      };

    case 'subscribeInfo':
      rejectUnknownFields(request, new Set(['type', 'instruments']), 'requests[]');

      return {
        subscribeInfoRequest: {
          subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
          instruments: parseArray(request['instruments'], 'requests[].instruments')
            .map((item) => parseInstrumentSubscription(item, 'requests[].instruments[]'))
            .map((item) => InfoInstrument.create({
              instrumentId: item.instrumentId
            }))
        }
      };

    case 'subscribeLastPrice':
      rejectUnknownFields(request, new Set(['type', 'instruments']), 'requests[]');

      return {
        subscribeLastPriceRequest: {
          subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
          instruments: parseArray(request['instruments'], 'requests[].instruments')
            .map((item) => parseInstrumentSubscription(item, 'requests[].instruments[]'))
            .map((item) => LastPriceInstrument.create({
              instrumentId: item.instrumentId
            }))
        }
      };

    case 'getMySubscriptions':
      rejectUnknownFields(request, new Set(['type']), 'requests[]');

      return {
        getMySubscriptions: {}
      };
  }
}

function parseMarketDataStreamRequestType(value: unknown): MarketDataStreamRequestType {
  if (typeof value !== 'string') {
    throw new CliUsageError("Expected 'requests[].type' as string");
  }

  if (!allowedMarketDataStreamRequestTypeSet.has(value)) {
    throw new CliUsageError(`Expected 'requests[].type' as one of: ${allowedMarketDataStreamRequestTypes.join(', ')}`);
  }

  return value as MarketDataStreamRequestType;
}

function parseMarketDataSubscriptions(value: unknown): MarketDataSubscriptions {
  const subscriptions = requireObject(value, 'subscriptions');
  rejectUnknownFields(subscriptions, allowedSubscriptionFields, 'subscriptions');

  const result = {
    candles: parseOptionalArray(subscriptions['candles'], 'subscriptions.candles')
      ?.map((item) => parseCandleSubscription(item, 'subscriptions.candles[]')),
    orderBooks: parseOptionalArray(subscriptions['orderBooks'], 'subscriptions.orderBooks')
      ?.map((item) => parseOrderBookSubscription(item, 'subscriptions.orderBooks[]')),
    trades: parseOptionalArray(subscriptions['trades'], 'subscriptions.trades')
      ?.map((item) => parseInstrumentSubscription(item, 'subscriptions.trades[]')),
    info: parseOptionalArray(subscriptions['info'], 'subscriptions.info')
      ?.map((item) => parseInstrumentSubscription(item, 'subscriptions.info[]')),
    lastPrices: parseOptionalArray(subscriptions['lastPrices'], 'subscriptions.lastPrices')
      ?.map((item) => parseInstrumentSubscription(item, 'subscriptions.lastPrices[]'))
  };

  const hasSubscriptions = Object.values(result).some((items) => (items?.length ?? 0) > 0);

  if (!hasSubscriptions) {
    throw new CliUsageError("Expected 'subscriptions' to contain at least one market data subscription");
  }

  if (result.candles !== undefined) {
    validateCandlesWaitingClose(result.candles);
  }

  return result;
}

function parseCandleSubscription(
  value: unknown,
  path: string
): CandleSubscriptionConfig {
  const candle = requireObject(value, path);
  rejectUnknownFields(
    candle,
    new Set(['instrumentId', 'interval', 'waitingClose']),
    path
  );

  return {
    instrumentId: parseInstrumentId(candle['instrumentId'], `${path}.instrumentId`),
    interval: parseCandleInterval(candle['interval'], `${path}.interval`),
    waitingClose: parseOptionalBoolean(
      candle['waitingClose'],
      `${path}.waitingClose`
    ) ?? false
  };
}

function parseOrderBookSubscription(
  value: unknown,
  path: string
): OrderBookSubscriptionConfig {
  const orderBook = requireObject(value, path);
  rejectUnknownFields(
    orderBook,
    new Set(['instrumentId', 'depth']),
    path
  );

  return {
    instrumentId: parseInstrumentId(orderBook['instrumentId'], `${path}.instrumentId`),
    depth: parsePositiveInteger(orderBook['depth'], `${path}.depth`)
  };
}

function parseInstrumentSubscription(
  value: unknown,
  path: string
): InstrumentSubscriptionConfig {
  const instrument = requireObject(value, path);
  rejectUnknownFields(instrument, new Set(['instrumentId']), path);

  return {
    instrumentId: parseInstrumentId(instrument['instrumentId'], `${path}.instrumentId`)
  };
}

function parseCandleInterval(value: unknown, path: string): SubscriptionInterval {
  if (typeof value !== 'string') {
    throw new CliUsageError(`Expected '${path}' as string`);
  }

  if (!Object.hasOwn(candleIntervalAliases, value)) {
    throw new CliUsageError(`Expected '${path}' as one of: 1min, 5min`);
  }

  return candleIntervalAliases[value as keyof typeof candleIntervalAliases];
}

function parseAccountIds(value: unknown, stream: string): string[] {
  const accounts = parseArray(value, 'accounts').map((item) => parseInstrumentId(item, 'accounts[]'));

  if (accounts.length === 0) {
    throw new CliUsageError(`Expected 'accounts' to contain at least one account id for ${stream}`);
  }

  return accounts;
}

function parseInstrumentId(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new CliUsageError(`Expected '${path}' as non-empty string`);
  }

  return value;
}

function parseOptionalBoolean(value: unknown, path: string): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'boolean') {
    throw new CliUsageError(`Expected '${path}' as boolean`);
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
    throw new CliUsageError(`Expected '${path}' as positive integer`);
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
    throw new CliUsageError(`Expected '${path}' as array`);
  }

  return value;
}

function requireObject(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new CliUsageError(`Expected '${path}' as object`);
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
      throw new CliUsageError(`Unexpected '${path}.${field}'`);
    }
  }
}

function assertAbsent(value: unknown, message: string): void {
  if (value !== undefined) {
    throw new CliUsageError(message);
  }
}

export function resolveCandlesWaitingClose(candles: CandleSubscriptionConfig[]): boolean {
  validateCandlesWaitingClose(candles);

  return candles[0]?.waitingClose ?? false;
}

function validateCandlesWaitingClose(candles: CandleSubscriptionConfig[]): void {
  const waitingClose = candles[0]?.waitingClose ?? false;

  if (candles.some((item) => item.waitingClose !== waitingClose)) {
    throw new CliUsageError("Expected 'subscriptions.candles[].waitingClose' to be the same for one request");
  }
}
