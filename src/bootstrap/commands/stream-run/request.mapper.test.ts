import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  MarketDataServerSideStreamRequest,
  OrderBookType,
  SubscriptionAction,
  SubscriptionInterval,
  TradeSourceType
} from '../../../generated/marketdata';
import { parseStreamRunConfig } from './config';
import {
  createMarketDataServerSideStreamRequest,
  createMarketDataStreamRequests,
  createPortfolioStreamRequest,
  createPositionsStreamRequest,
  createTradesStreamRequest
} from './request.mapper';

function configJson(value: unknown): string {
  return JSON.stringify(value);
}

describe('stream request mapper', () => {
  test('возвращает initial requests bidirectional market data stream', () => {
    const config = parseStreamRunConfig(configJson({
      stream: 'marketdata.marketDataStream',
      requests: [{ type: 'getMySubscriptions' }]
    }));

    assert.deepEqual(createMarketDataStreamRequests(config), [
      { getMySubscriptions: {} }
    ]);
  });

  test('создаёт server-side market data request', () => {
    const config = parseStreamRunConfig(configJson({
      stream: 'marketdata.marketDataServerSideStream',
      subscriptions: {
        candles: [{
          instrumentId: 'instrument-id',
          interval: '1min',
          waitingClose: true
        }],
        orderBooks: [{
          instrumentId: 'order-book-id',
          depth: 10
        }],
        trades: [{ instrumentId: 'trade-id' }],
        info: [{ instrumentId: 'info-id' }],
        lastPrices: [{ instrumentId: 'last-price-id' }]
      }
    }));
    const request = createMarketDataServerSideStreamRequest(config);

    assert.deepEqual(request.subscribeCandlesRequest, {
      subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
      instruments: [{
        figi: '',
        interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
        instrumentId: 'instrument-id'
      }],
      waitingClose: true
    });
    assert.deepEqual(request.subscribeOrderBookRequest?.instruments, [{
      figi: '',
      depth: 10,
      instrumentId: 'order-book-id',
      orderBookType: OrderBookType.ORDERBOOK_TYPE_UNSPECIFIED
    }]);
    assert.deepEqual(request.subscribeTradesRequest?.instruments, [{
      figi: '',
      instrumentId: 'trade-id'
    }]);
    assert.equal(
      request.subscribeTradesRequest?.tradeSource,
      TradeSourceType.TRADE_SOURCE_UNSPECIFIED
    );
    assert.equal(request.subscribeTradesRequest?.withOpenInterest, false);
    assert.deepEqual(request.subscribeInfoRequest?.instruments, [{
      figi: '',
      instrumentId: 'info-id'
    }]);
    assert.deepEqual(request.subscribeLastPriceRequest?.instruments, [{
      figi: '',
      instrumentId: 'last-price-id'
    }]);
    assert.doesNotMatch(
      JSON.stringify(MarketDataServerSideStreamRequest.toJSON(request)),
      /"figi":/
    );
  });

  test('создаёт portfolio stream request', () => {
    const config = parseStreamRunConfig(configJson({
      stream: 'operations.portfolioStream',
      accounts: ['account-id']
    }));

    assert.deepEqual(createPortfolioStreamRequest(config), {
      accounts: ['account-id'],
      pingSettings: undefined
    });
  });

  test('создаёт positions stream request', () => {
    const config = parseStreamRunConfig(configJson({
      stream: 'operations.positionsStream',
      accounts: ['account-id']
    }));

    assert.deepEqual(createPositionsStreamRequest(config), {
      accounts: ['account-id'],
      withInitialPositions: false,
      pingSettings: undefined
    });
  });

  test('создаёт trades stream request', () => {
    const config = parseStreamRunConfig(configJson({
      stream: 'orders.tradesStream',
      accounts: ['account-id']
    }));

    assert.deepEqual(createTradesStreamRequest(config), {
      accounts: ['account-id']
    });
  });
});
