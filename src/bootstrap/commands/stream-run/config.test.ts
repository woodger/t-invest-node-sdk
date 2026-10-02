import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  SubscriptionInterval
} from '../../../generated/marketdata';
import {
  parseStreamRunConfig,
  type MarketDataStreamRequestConfig,
  type StreamRunConfig,
  type StreamRunRuntime
} from './config';

function configJson(value: unknown): string {
  return JSON.stringify(value);
}

describe('stream run config', () => {
  describe('parseStreamRunConfig', () => {
    test('matches typed payload fields to the selected stream', () => {
      const requiredPayloads = {
        requests: true satisfies (
          { stream: 'marketdata.marketDataStream'; runtime: StreamRunRuntime } extends StreamRunConfig
            ? false
            : true
        ),
        subscriptions: true satisfies (
          { stream: 'marketdata.marketDataServerSideStream'; runtime: StreamRunRuntime } extends StreamRunConfig
            ? false
            : true
        ),
        accounts: true satisfies (
          { stream: 'orders.tradesStream'; runtime: StreamRunRuntime } extends StreamRunConfig
            ? false
            : true
        ),
        incompatibleFields: true satisfies (
          {
            stream: 'marketdata.marketDataStream';
            requests: MarketDataStreamRequestConfig[];
            accounts: string[];
            runtime: StreamRunRuntime;
          } extends StreamRunConfig
            ? false
            : true
        )
      };

      assert.deepEqual(requiredPayloads, {
        requests: true,
        subscriptions: true,
        accounts: true,
        incompatibleFields: true
      });
    });

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

      assert.ok(config.stream === 'operations.portfolioStream');
      assert.deepEqual(config.accounts, ['account-id']);
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

      assert.ok(config.stream === 'marketdata.marketDataStream');
      assert.deepEqual(config.requests, [
        {
          type: 'subscribeCandles',
          instruments: [{
            instrumentId: 'candle-id',
            interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
            waitingClose: false
          }]
        },
        {
          type: 'subscribeOrderBook',
          instruments: [{ instrumentId: 'order-book-id', depth: 10 }]
        },
        {
          type: 'subscribeTrades',
          instruments: [{ instrumentId: 'trade-id' }]
        },
        {
          type: 'subscribeInfo',
          instruments: [{ instrumentId: 'info-id' }]
        },
        {
          type: 'subscribeLastPrice',
          instruments: [{ instrumentId: 'last-price-id' }]
        },
        {
          type: 'getMySubscriptions'
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

  describe('market data config validation', () => {
    for (const stream of [
      'marketdata.marketDataStream',
      'marketdata.marketDataServerSideStream'
    ]) {
      test(`validates int32 order book depth for ${stream}`, () => {
        const createConfig = (depth: number) => ({
          stream,
          ...(stream === 'marketdata.marketDataStream'
            ? {
              requests: [{
                type: 'subscribeOrderBook',
                instruments: [{ instrumentId: 'instrument-id', depth }]
              }]
            }
            : {
              subscriptions: {
                orderBooks: [{ instrumentId: 'instrument-id', depth }]
              }
            })
        });

        const config = parseStreamRunConfig(configJson(createConfig(2_147_483_647)));
        if (config.stream === 'marketdata.marketDataStream') {
          const request = config.requests[0];

          assert.ok(request?.type === 'subscribeOrderBook');
          assert.equal(request.instruments[0]?.depth, 2_147_483_647);
        }
        else {
          assert.ok(config.stream === 'marketdata.marketDataServerSideStream');
          assert.equal(config.subscriptions.orderBooks?.[0]?.depth, 2_147_483_647);
        }

        assert.throws(
          () => parseStreamRunConfig(configJson(createConfig(2_147_483_648))),
          /depth' to be less than or equal to 2147483647/
        );
      });
    }

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
