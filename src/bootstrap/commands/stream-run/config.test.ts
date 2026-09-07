import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  MarketDataServerSideStreamRequest,
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
            type: 'subscribeCandles',
            instruments: [
              {
                instrumentId: 'candle-id',
                interval: '1min'
              }
            ]
          },
          {
            type: 'subscribeOrderBook',
            instruments: [
              {
                instrumentId: 'order-book-id',
                depth: 10
              }
            ]
          },
          {
            type: 'subscribeTrades',
            instruments: [
              {
                instrumentId: 'trade-id'
              }
            ]
          },
          {
            type: 'subscribeInfo',
            instruments: [
              {
                instrumentId: 'info-id'
              }
            ]
          },
          {
            type: 'subscribeLastPrice',
            instruments: [
              {
                instrumentId: 'last-price-id'
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
          subscribeCandlesRequest: {
            subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
            instruments: [
              {
                figi: '',
                interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
                instrumentId: 'candle-id'
              }
            ],
            waitingClose: false
          }
        },
        {
          subscribeOrderBookRequest: {
            subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
            instruments: [
              {
                figi: '',
                depth: 10,
                instrumentId: 'order-book-id',
                orderBookType: OrderBookType.ORDERBOOK_TYPE_UNSPECIFIED
              }
            ]
          }
        },
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
          subscribeInfoRequest: {
            subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
            instruments: [
              {
                figi: '',
                instrumentId: 'info-id'
              }
            ]
          }
        },
        {
          subscribeLastPriceRequest: {
            subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
            instruments: [
              {
                figi: '',
                instrumentId: 'last-price-id'
              }
            ]
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
          ],
          info: [
            {
              instrumentId: 'info-id'
            }
          ],
          lastPrices: [
            {
              instrumentId: 'last-price-id'
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
      assert.deepEqual(request.subscribeInfoRequest?.instruments, [
        {
          figi: '',
          instrumentId: 'info-id'
        }
      ]);
      assert.deepEqual(request.subscribeLastPriceRequest?.instruments, [
        {
          figi: '',
          instrumentId: 'last-price-id'
        }
      ]);
      assert.doesNotMatch(
        JSON.stringify(MarketDataServerSideStreamRequest.toJSON(request)),
        /"figi":/
      );
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

    test('rejects inherited object property names as candle intervals', () => {
      assert.throws(
        () => parseStreamRunConfig(configJson({
          stream: 'marketdata.marketDataServerSideStream',
          subscriptions: {
            candles: [
              {
                instrumentId: 'instrument-id',
                interval: 'toString'
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
