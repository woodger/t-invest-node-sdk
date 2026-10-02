/**
 * Модуль преобразует проверенный stream config в generated requests.
 *
 * Здесь не должно быть чтения JSON, SDK calls или управления stream lifecycle.
 */

import {
  CandleInstrument,
  InfoInstrument,
  LastPriceInstrument,
  OrderBookType,
  OrderBookInstrument,
  SubscriptionAction,
  TradeSourceType,
  TradeInstrument,
  type MarketDataRequest,
  type MarketDataServerSideStreamRequest,
  type SubscribeCandlesRequest,
  type SubscribeInfoRequest,
  type SubscribeLastPriceRequest,
  type SubscribeOrderBookRequest,
  type SubscribeTradesRequest
} from '../../../generated/marketdata';
import type {
  PortfolioStreamRequest,
  PositionsStreamRequest
} from '../../../generated/operations';
import type { TradesStreamRequest } from '../../../generated/orders';
import { CliUsageError } from 'icore';
import {
  resolveCandlesWaitingClose,
  type CandleSubscriptionConfig,
  type InstrumentSubscriptionConfig,
  type OrderBookSubscriptionConfig,
  type StreamRunConfig
} from './config';

export function createMarketDataStreamRequests(
  config: StreamRunConfig
): MarketDataRequest[] {
  if (config.stream !== 'marketdata.marketDataStream') {
    throw new CliUsageError(`Expected marketdata bidirectional stream config, got '${config.stream}'`);
  }

  return config.requests.map((request) => {
    switch (request.type) {
      case 'subscribeCandles':
        return { subscribeCandlesRequest: createSubscribeCandlesRequest(request.instruments) };

      case 'subscribeOrderBook':
        return { subscribeOrderBookRequest: createSubscribeOrderBookRequest(request.instruments) };

      case 'subscribeTrades':
        return { subscribeTradesRequest: createSubscribeTradesRequest(request.instruments) };

      case 'subscribeInfo':
        return { subscribeInfoRequest: createSubscribeInfoRequest(request.instruments) };

      case 'subscribeLastPrice':
        return { subscribeLastPriceRequest: createSubscribeLastPriceRequest(request.instruments) };

      case 'getMySubscriptions':
        return { getMySubscriptions: {} };
    }
  });
}

export function createMarketDataServerSideStreamRequest(
  config: StreamRunConfig
): MarketDataServerSideStreamRequest {
  if (config.stream !== 'marketdata.marketDataServerSideStream') {
    throw new CliUsageError(`Expected marketdata server-side stream config, got '${config.stream}'`);
  }

  const subscriptions = config.subscriptions;

  if (!subscriptions) {
    throw new CliUsageError("Expected 'subscriptions' for marketdata server-side stream config");
  }

  const candles = subscriptions.candles ?? [];
  const orderBooks = subscriptions.orderBooks ?? [];
  const trades = subscriptions.trades ?? [];
  const info = subscriptions.info ?? [];
  const lastPrices = subscriptions.lastPrices ?? [];

  return {
    subscribeCandlesRequest: candles.length > 0
      ? createSubscribeCandlesRequest(candles)
      : undefined,
    subscribeOrderBookRequest: orderBooks.length > 0
      ? createSubscribeOrderBookRequest(orderBooks)
      : undefined,
    subscribeTradesRequest: trades.length > 0
      ? createSubscribeTradesRequest(trades)
      : undefined,
    subscribeInfoRequest: info.length > 0
      ? createSubscribeInfoRequest(info)
      : undefined,
    subscribeLastPriceRequest: lastPrices.length > 0
      ? createSubscribeLastPriceRequest(lastPrices)
      : undefined,
    pingSettings: undefined
  };
}

export function createPortfolioStreamRequest(
  config: StreamRunConfig
): PortfolioStreamRequest {
  if (config.stream !== 'operations.portfolioStream') {
    throw new CliUsageError(`Expected portfolio stream config, got '${config.stream}'`);
  }

  return {
    accounts: config.accounts,
    pingSettings: undefined
  };
}

export function createPositionsStreamRequest(
  config: StreamRunConfig
): PositionsStreamRequest {
  if (config.stream !== 'operations.positionsStream') {
    throw new CliUsageError(`Expected positions stream config, got '${config.stream}'`);
  }

  return {
    accounts: config.accounts,
    withInitialPositions: false,
    pingSettings: undefined
  };
}

export function createTradesStreamRequest(
  config: StreamRunConfig
): TradesStreamRequest {
  if (config.stream !== 'orders.tradesStream') {
    throw new CliUsageError(`Expected trades stream config, got '${config.stream}'`);
  }

  return {
    accounts: config.accounts
  };
}

function createSubscribeCandlesRequest(
  instruments: CandleSubscriptionConfig[]
): SubscribeCandlesRequest {
  return {
    subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
    instruments: instruments.map((item) => CandleInstrument.create({
      interval: item.interval,
      instrumentId: item.instrumentId
    })),
    waitingClose: resolveCandlesWaitingClose(instruments)
  };
}

function createSubscribeOrderBookRequest(
  instruments: OrderBookSubscriptionConfig[]
): SubscribeOrderBookRequest {
  return {
    subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
    instruments: instruments.map((item) => OrderBookInstrument.create({
      depth: item.depth,
      instrumentId: item.instrumentId,
      orderBookType: OrderBookType.ORDERBOOK_TYPE_UNSPECIFIED
    }))
  };
}

function createSubscribeTradesRequest(
  instruments: InstrumentSubscriptionConfig[]
): SubscribeTradesRequest {
  return {
    subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
    instruments: instruments.map((item) => TradeInstrument.create({
      instrumentId: item.instrumentId
    })),
    tradeSource: TradeSourceType.TRADE_SOURCE_UNSPECIFIED,
    withOpenInterest: false
  };
}

function createSubscribeInfoRequest(
  instruments: InstrumentSubscriptionConfig[]
): SubscribeInfoRequest {
  return {
    subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
    instruments: instruments.map((item) => InfoInstrument.create({
      instrumentId: item.instrumentId
    }))
  };
}

function createSubscribeLastPriceRequest(
  instruments: InstrumentSubscriptionConfig[]
): SubscribeLastPriceRequest {
  return {
    subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
    instruments: instruments.map((item) => LastPriceInstrument.create({
      instrumentId: item.instrumentId
    }))
  };
}
