import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  OrderBookType,
  SubscriptionAction,
  SubscriptionInterval,
  TradeSourceType
} from '../../../generated/marketdata';
import {
  createAccountStreamRequest,
  createMarketDataStreamRequests,
  createMarketDataServerSideStreamRequest,
  parseStreamRunConfig
} from './config';

function configJson(value: unknown): string {
  return JSON.stringify(value);
}

describe('stream run config', () => {
  describe('parseStreamRunConfig', () => {
    test('returns account stream config', () => {
      const config = parseStreamRunConfig(configJson({
        stream: 'operations.portfolioStream',
        accounts: ['account-id'],
        runtime: {
          format: 'jsonl',
          maxEvents: 2,
          includePings: true
        }
      }));

      assert.equal(config.stream, 'operations.portfolioStream');
      assert.deepEqual(createAccountStreamRequest(config), {
        accounts: ['account-id'],
        pingSettings: undefined
      });
      assert.equal(config.runtime.maxEvents, 2);
      assert.equal(config.runtime.includePings, true);
      assert.equal(config.runtime.includeSubscriptionEvents, true);
      assert.equal(config.runtime.raw, false);
    });

    test('returns bidirectional market data stream requests', () => {
      const config = parseStreamRunConfig(configJson({
        stream: 'marketdata.marketDataStream',
        requests: [
          {
            type: 'subscribeTrades',
            instruments: [
              {
                instrumentId: 'trade-id'
              }
            ]
          },
          {
            type: 'getMySubscriptions'
          }
        ],
        runtime: {
          maxEvents: 2
        }
      }));

      assert.equal(config.stream, 'marketdata.marketDataStream');
      assert.deepEqual(createMarketDataStreamRequests(config), [
        {
          subscribeTradesRequest: {
            subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
            instruments: [
              {
                figi: '',
                instrumentId: 'trade-id'
              }
            ],
            tradeSource: TradeSourceType.TRADE_SOURCE_UNSPECIFIED,
            withOpenInterest: false
          }
        },
        {
          getMySubscriptions: {}
        }
      ]);
    });

    test('rejects bidirectional market data stream without initial requests', () => {
      assert.throws(
        () => parseStreamRunConfig(configJson({
          stream: 'marketdata.marketDataStream',
          requests: []
        })),
        /Expected 'requests' to contain at least one market data stream request/
      );
    });

    test('rejects unknown config fields', () => {
      assert.throws(
        () => parseStreamRunConfig(configJson({
          stream: 'orders.tradesStream',
          accounts: ['account-id'],
          output: 'stdout'
        })),
        /Unexpected 'stream config\.output'/
      );
    });
  });

  describe('createMarketDataServerSideStreamRequest', () => {
    test('returns generated request shape for market data subscriptions', () => {
      const config = parseStreamRunConfig(configJson({
        stream: 'marketdata.marketDataServerSideStream',
        subscriptions: {
          candles: [
            {
              instrumentId: 'instrument-id',
              interval: '1min',
              waitingClose: true
            }
          ],
          orderBooks: [
            {
              instrumentId: 'order-book-id',
              depth: 10
            }
          ],
          trades: [
            {
              instrumentId: 'trade-id'
            }
          ]
        }
      }));

      const request = createMarketDataServerSideStreamRequest(config);

      assert.deepEqual(request.subscribeCandlesRequest, {
        subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
        instruments: [
          {
            figi: '',
            interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
            instrumentId: 'instrument-id'
          }
        ],
        waitingClose: true
      });
      assert.deepEqual(request.subscribeOrderBookRequest?.instruments, [
        {
          figi: '',
          depth: 10,
          instrumentId: 'order-book-id',
          orderBookType: OrderBookType.ORDERBOOK_TYPE_UNSPECIFIED
        }
      ]);
      assert.deepEqual(request.subscribeTradesRequest?.instruments, [
        {
          figi: '',
          instrumentId: 'trade-id'
        }
      ]);
      assert.equal(
        request.subscribeTradesRequest?.tradeSource,
        TradeSourceType.TRADE_SOURCE_UNSPECIFIED
      );
      assert.equal(request.subscribeTradesRequest?.withOpenInterest, false);
      assert.equal(request.subscribeInfoRequest, undefined);
      assert.equal(request.subscribeLastPriceRequest, undefined);
    });

    test('rejects unsupported stream candle interval aliases', () => {
      assert.throws(
        () => parseStreamRunConfig(configJson({
          stream: 'marketdata.marketDataServerSideStream',
          subscriptions: {
            candles: [
              {
                instrumentId: 'instrument-id',
                interval: '10min'
              }
            ]
          }
        })),
        /Expected 'subscriptions\.candles\[\]\.interval' as one of: 1min, 5min/
      );
    });

    test('rejects mixed candle waitingClose values during config parsing', () => {
      assert.throws(
        () => parseStreamRunConfig(configJson({
          stream: 'marketdata.marketDataServerSideStream',
          subscriptions: {
            candles: [
              {
                instrumentId: 'first-id',
                interval: '1min',
                waitingClose: true
              },
              {
                instrumentId: 'second-id',
                interval: '1min',
                waitingClose: false
              }
            ]
          }
        })),
        /Expected 'subscriptions\.candles\[\]\.waitingClose' to be the same/
      );
    });
  });
});
