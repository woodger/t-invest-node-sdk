import assert from 'node:assert/strict';
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

    test('rejects malformed JSON', () => {
      assert.throws(
        () => parseStreamRunConfig('{'),
        /Expected stream config as JSON object/
      );
    });

    test('rejects JSON values that are not objects', () => {
      for (const value of [null, [], 'stream', 1]) {
        assert.throws(
          () => parseStreamRunConfig(configJson(value)),
          /Expected 'stream config' as object/
        );
      }
    });

    test('rejects a missing stream name', () => {
      assert.throws(
        () => parseStreamRunConfig(configJson({})),
        /Expected 'stream' as string/
      );
    });

    test('rejects an unsupported stream name', () => {
      assert.throws(
        () => parseStreamRunConfig(configJson({ stream: 'unknown.stream' })),
        /Expected 'stream' as one of:/
      );
    });

    const streamConfigs = [
      {
        input: {
          stream: 'marketdata.marketDataStream',
          requests: [{ type: 'getMySubscriptions' }]
        },
        forbidden: ['accounts', 'subscriptions', 'rawRequests']
      },
      {
        input: {
          stream: 'marketdata.marketDataServerSideStream',
          subscriptions: { trades: [{ instrumentId: 'instrument-id' }] }
        },
        forbidden: ['accounts', 'requests', 'rawRequests']
      },
      ...['operations.portfolioStream', 'operations.positionsStream', 'orders.tradesStream'].map((stream) => ({
        input: { stream, accounts: ['account-id'] },
        forbidden: ['requests', 'subscriptions', 'rawRequests']
      }))
    ];

    for (const { input, forbidden } of streamConfigs) {
      for (const field of forbidden) {
        test(`rejects '${field}' in ${input.stream} config`, () => {
          for (const value of [null, []]) {
            assert.throws(
              () => parseStreamRunConfig(configJson({ ...input, [field]: value })),
              new RegExp(`Expected '${field}' to be omitted`)
            );
          }
        });
      }
    }

    for (const stream of ['operations.portfolioStream', 'operations.positionsStream', 'orders.tradesStream']) {
      test(`rejects missing or non-array accounts for ${stream}`, () => {
        for (const accounts of [undefined, null, 'account-id']) {
          assert.throws(
            () => parseStreamRunConfig(configJson({ stream, accounts })),
            /Expected 'accounts' as array/
          );
        }
      });

      test(`rejects empty accounts for ${stream}`, () => {
        assert.throws(
          () => parseStreamRunConfig(configJson({ stream, accounts: [] })),
          /Expected 'accounts' to contain at least one account id/
        );
      });

      test(`rejects blank or non-string account ids for ${stream}`, () => {
        for (const accountId of ['', ' ', 1]) {
          assert.throws(
            () => parseStreamRunConfig(configJson({ stream, accounts: [accountId] })),
            /Expected 'accounts\[\]' as non-empty string/
          );
        }
      });
    }

    test('rejects missing or non-object server-side subscriptions', () => {
      for (const subscriptions of [undefined, null, []]) {
        assert.throws(
          () => parseStreamRunConfig(configJson({
            stream: 'marketdata.marketDataServerSideStream',
            subscriptions
          })),
          /Expected 'subscriptions' as object/
        );
      }
    });

    test('rejects server-side config without any subscriptions', () => {
      for (const subscriptions of [{}, { trades: [] }]) {
        assert.throws(
          () => parseStreamRunConfig(configJson({
            stream: 'marketdata.marketDataServerSideStream',
            subscriptions
          })),
          /Expected 'subscriptions' to contain at least one market data subscription/
        );
      }
    });

    test('rejects missing or non-array bidirectional requests', () => {
      for (const requests of [undefined, null, {}]) {
        assert.throws(
          () => parseStreamRunConfig(configJson({
            stream: 'marketdata.marketDataStream',
            requests
          })),
          /Expected 'requests' as array/
        );
      }
    });
  });

  describe('runtime config validation', () => {
    test('uses runtime defaults when runtime is omitted or empty', () => {
      for (const runtime of [undefined, {}]) {
        const config = parseStreamRunConfig(configJson({
          stream: 'orders.tradesStream',
          accounts: ['account-id'],
          runtime
        }));

        assert.equal(config.runtime.format, 'jsonl');
        assert.equal(config.runtime.includePings, false);
        assert.equal(config.runtime.includeSubscriptionEvents, true);
        assert.equal(config.runtime.raw, false);
        assert.equal(config.runtime.maxEvents, undefined);
        assert.equal(config.runtime.durationMs, undefined);
        assert.equal(config.runtime.idleTimeoutMs, undefined);
      }
    });

    test('rejects non-object runtime values', () => {
      for (const runtime of [null, [], 'runtime']) {
        assert.throws(
          () => parseStreamRunConfig(configJson({
            stream: 'orders.tradesStream',
            accounts: ['account-id'],
            runtime
          })),
          /Expected 'runtime' as object/
        );
      }
    });

    test('rejects unknown runtime fields', () => {
      assert.throws(
        () => parseStreamRunConfig(configJson({
          stream: 'orders.tradesStream',
          accounts: ['account-id'],
          runtime: { timeout: 1 }
        })),
        /Unexpected 'runtime\.timeout'/
      );
    });

    test('rejects unsupported runtime output formats', () => {
      assert.throws(
        () => parseStreamRunConfig(configJson({
          stream: 'orders.tradesStream',
          accounts: ['account-id'],
          runtime: { format: 'csv' }
        })),
        /Expected 'runtime\.format' as one of: jsonl/
      );
    });

    for (const field of ['maxEvents', 'durationMs', 'idleTimeoutMs'] as const) {
      test(`accepts positive safe integer boundaries for '${field}'`, () => {
        for (const value of [1, 9_007_199_254_740_991]) {
          const config = parseStreamRunConfig(configJson({
            stream: 'orders.tradesStream',
            accounts: ['account-id'],
            runtime: { [field]: value }
          }));

          assert.equal(config.runtime[field], value);
        }
      });

      test(`rejects invalid positive safe integers for '${field}'`, () => {
        for (const value of [0, -1, 1.5, 9_007_199_254_740_992, '1', null]) {
          assert.throws(
            () => parseStreamRunConfig(configJson({
              stream: 'orders.tradesStream',
              accounts: ['account-id'],
              runtime: { [field]: value }
            })),
            { message: `Expected 'runtime.${field}' as positive integer` },
            String(value)
          );
        }
      });
    }

    test('preserves explicit runtime booleans', () => {
      const config = parseStreamRunConfig(configJson({
        stream: 'orders.tradesStream',
        accounts: ['account-id'],
        runtime: { includePings: true, includeSubscriptionEvents: false, raw: true }
      }));

      assert.equal(config.runtime.includePings, true);
      assert.equal(config.runtime.includeSubscriptionEvents, false);
      assert.equal(config.runtime.raw, true);
    });

    for (const field of ['includePings', 'includeSubscriptionEvents', 'raw']) {
      test(`rejects non-boolean values for '${field}'`, () => {
        for (const value of ['false', 0, null]) {
          assert.throws(
            () => parseStreamRunConfig(configJson({
              stream: 'orders.tradesStream',
              accounts: ['account-id'],
              runtime: { [field]: value }
            })),
            { message: `Expected 'runtime.${field}' as boolean` }
          );
        }
      });
    }
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
