/**
 * Модуль stream run reporter нормализует provider stream events в JSONL output.
 *
 * Здесь допустимы:
 * - определение observable event type;
 * - фильтрация ping/subscription events по runtime options;
 * - сборка стабильного JSONL envelope;
 *
 * Здесь не должно быть stream lifecycle management или SDK request creation.
 */

import type { MarketDataResponse } from '../../../generated/marketdata';
import type {
  PortfolioStreamResponse,
  PositionsStreamResponse
} from '../../../generated/operations';
import type { TradesStreamResponse } from '../../../generated/orders';

export const streamRunFormats = ['jsonl'] as const;

export type StreamRunResponse =
  | MarketDataResponse
  | PortfolioStreamResponse
  | PositionsStreamResponse
  | TradesStreamResponse;

export type StreamRunReportOptions = {
  stream: string;
  sequence: number;
  receivedAt: string;
  includePings: boolean;
  includeSubscriptionEvents: boolean;
  raw: boolean;
};

type StreamRunEvent = {
  type: string;
  payload: unknown;
};

const streamEventFields = [
  'subscribeCandlesResponse',
  'subscribeOrderBookResponse',
  'subscribeTradesResponse',
  'subscribeInfoResponse',
  'subscribeLastPriceResponse',
  'candle',
  'trade',
  'orderbook',
  'tradingStatus',
  'lastPrice',
  'subscriptions',
  'portfolio',
  'position',
  'orderTrades',
  'ping'
] as const;

const subscriptionEventTypes = new Set([
  'subscribeCandlesResponse',
  'subscribeOrderBookResponse',
  'subscribeTradesResponse',
  'subscribeInfoResponse',
  'subscribeLastPriceResponse',
  'subscriptions'
]);

export function formatStreamRunResponse(
  response: StreamRunResponse,
  options: StreamRunReportOptions
): string | undefined {
  const event = resolveStreamRunEvent(response);

  if (event.type === 'ping' && !options.includePings) {
    return undefined;
  }

  if (subscriptionEventTypes.has(event.type) && !options.includeSubscriptionEvents) {
    return undefined;
  }

  if (options.raw) {
    return `${JSON.stringify(response)}\n`;
  }

  return `${JSON.stringify({
    stream: options.stream,
    sequence: options.sequence,
    receivedAt: options.receivedAt,
    type: event.type,
    payload: event.payload
  })}\n`;
}

export function resolveStreamRunEvent(response: StreamRunResponse): StreamRunEvent {
  const record = response as Record<string, unknown>;

  for (const field of streamEventFields) {
    const payload = record[field];

    if (payload !== undefined) {
      return {
        type: field,
        payload
      };
    }
  }

  return {
    type: 'unknown',
    payload: response
  };
}
