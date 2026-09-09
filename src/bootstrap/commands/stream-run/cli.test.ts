import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  SubscriptionAction,
  TradeSourceType,
  type MarketDataRequest,
  type MarketDataResponse
} from '../../../generated/marketdata';
import type {
  PortfolioStreamRequest,
  PortfolioStreamResponse
} from '../../../generated/operations';
import type { TradesStreamResponse
} from '../../../generated/orders';
import { createStreamRunCommand } from './cli';

async function collectOutput(output: AsyncIterable<string>): Promise<string> {
  let result = '';

  for await (const chunk of output) {
    result += chunk;
  }

  return result;
}

async function* responses<T>(...items: T[]): AsyncIterable<T> {
  for (const item of items) {
    yield item;
  }
}

async function collectRequests<T>(requests: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];

  for await (const request of requests) {
    result.push(request);
  }

  return result;
}

function createUnusedStream(name: string) {
  return () => {
    throw new Error(`${name} should not be called`);
  };
}

describe('stream run command', () => {
  describe('createStreamRunCommand', () => {
    test('runs operations portfolio stream and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: PortfolioStreamRequest | undefined;
      let closeCalls = 0;
      const command = createStreamRunCommand({
        readConfig: async () => JSON.stringify({
          stream: 'operations.portfolioStream',
          accounts: ['account-id'],
          runtime: {
            maxEvents: 1
          }
        }),
        now: () => new Date('2026-06-29T12:00:00.000Z'),
        createSdk(options) {
          receivedOptions = options;

          return {
            marketdataStream: {
              marketDataStream: createUnusedStream('marketDataStream'),
              marketDataServerSideStream: createUnusedStream('marketDataServerSideStream')
            },
            operationsStream: {
              portfolioStream(request) {
                receivedRequest = request;

                return responses({
                  portfolio: {
                    accountId: 'account-id'
                  }
                } as PortfolioStreamResponse);
              },
              positionsStream: createUnusedStream('positionsStream')
            },
            ordersStream: {
              tradesStream: createUnusedStream('tradesStream')
            },
            close() {
              closeCalls += 1;
            }
          };
        }
      });

      const output = await commandFacade.run(
        command,
        [
          'stream',
          'run',
          '--config=stream.json',
          '--token=token',
          '--endpoint=localhost:50051'
        ],
        undefined
      );

      const lines = (await collectOutput(output)).trim().split('\n');

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        accounts: ['account-id'],
        pingSettings: undefined
      });
      assert.equal(closeCalls, 1);
      const [line] = lines;

      if (line === undefined) {
        throw new Error('Expected stream output line');
      }

      assert.deepEqual(JSON.parse(line), {
        stream: 'operations.portfolioStream',
        sequence: 1,
        receivedAt: '2026-06-29T12:00:00.000Z',
        type: 'portfolio',
        payload: {
          accountId: 'account-id'
        }
      });
    });

    test('applies runtime overrides from CLI options', async () => {
      const command = createStreamRunCommand({
        readConfig: async () => JSON.stringify({
          stream: 'orders.tradesStream',
          accounts: ['account-id'],
          runtime: {
            maxEvents: 1
          }
        }),
        now: () => new Date('2026-06-29T12:00:00.000Z'),
        createSdk() {
          return {
            marketdataStream: {
              marketDataStream: createUnusedStream('marketDataStream'),
              marketDataServerSideStream: createUnusedStream('marketDataServerSideStream')
            },
            operationsStream: {
              portfolioStream: createUnusedStream('portfolioStream'),
              positionsStream: createUnusedStream('positionsStream')
            },
            ordersStream: {
              tradesStream() {
                return responses(
                  {
                    ping: {
                      time: new Date('2026-06-29T12:00:00.000Z')
                    }
                  } as TradesStreamResponse,
                  {
                    orderTrades: {
                      orderId: 'order-id'
                    }
                  } as TradesStreamResponse
                );
              }
            },
            // Тестовый SDK не владеет ресурсами.
            // oxlint-disable-next-line no-empty-function
            close() {}
          };
        }
      });

      const output = await commandFacade.run(
        command,
        [
          'stream',
          'run',
          '--config=stream.json',
          '--token=token',
          '--endpoint=localhost:50051',
          '--max-events=2',
          '--include-pings',
          '--raw'
        ],
        undefined
      );

      assert.deepEqual(
        (await collectOutput(output)).trim().split('\n').map(
          (line): unknown => JSON.parse(line) as unknown
        ),
        [
          {
            ping: {
              time: '2026-06-29T12:00:00.000Z'
            }
          },
          {
            orderTrades: {
              orderId: 'order-id'
            }
          }
        ]
      );
    });

    test('applies negated boolean runtime overrides from CLI options', async () => {
      const command = createStreamRunCommand({
        readConfig: async () => JSON.stringify({
          stream: 'orders.tradesStream',
          accounts: ['account-id'],
          runtime: {
            maxEvents: 1,
            includePings: true,
            raw: true
          }
        }),
        now: () => new Date('2026-06-29T12:00:00.000Z'),
        createSdk() {
          return {
            marketdataStream: {
              marketDataStream: createUnusedStream('marketDataStream'),
              marketDataServerSideStream: createUnusedStream('marketDataServerSideStream')
            },
            operationsStream: {
              portfolioStream: createUnusedStream('portfolioStream'),
              positionsStream: createUnusedStream('positionsStream')
            },
            ordersStream: {
              tradesStream() {
                return responses(
                  {
                    ping: {
                      time: new Date('2026-06-29T12:00:00.000Z')
                    }
                  } as TradesStreamResponse,
                  {
                    orderTrades: {
                      orderId: 'order-id'
                    }
                  } as TradesStreamResponse
                );
              }
            },
            // Тестовый SDK не владеет ресурсами.
            // oxlint-disable-next-line no-empty-function
            close() {}
          };
        }
      });

      const output = await commandFacade.run(
        command,
        [
          'stream',
          'run',
          '--config=stream.json',
          '--token=token',
          '--endpoint=localhost:50051',
          '--no-include-pings',
          '--no-raw'
        ],
        undefined
      );

      assert.deepEqual(JSON.parse((await collectOutput(output)).trim()), {
        stream: 'orders.tradesStream',
        sequence: 1,
        receivedAt: '2026-06-29T12:00:00.000Z',
        type: 'orderTrades',
        payload: {
          orderId: 'order-id'
        }
      });
    });

    test('rejects assigned values for boolean runtime options', async () => {
      const command = createStreamRunCommand({
        readConfig() {
          throw new Error('Config should not be read');
        }
      });

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'stream',
            'run',
            '--config=stream.json',
            '--raw=false'
          ],
          undefined
        ),
        /Expected '--raw' as boolean flag/
      );
    });

    test('rejects invalid config before sdk creation', async () => {
      let createSdkCalls = 0;
      const command = createStreamRunCommand({
        readConfig: async () => JSON.stringify({
          stream: 'marketdata.marketDataStream',
          requests: []
        }),
        createSdk() {
          createSdkCalls += 1;

          throw new Error('sdk should not be created');
        }
      });

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'stream',
            'run',
            '--config=stream.json'
          ],
          undefined
        ),
        /Expected 'requests' to contain at least one market data stream request/
      );
      assert.equal(createSdkCalls, 0);
    });

    test('runs market data bidirectional stream with initial requests', async () => {
      let receivedRequests: Promise<MarketDataRequest[]> | undefined;
      const command = createStreamRunCommand({
        readConfig: async () => JSON.stringify({
          stream: 'marketdata.marketDataStream',
          requests: [
            {
              type: 'subscribeTrades',
              instruments: [
                {
                  instrumentId: 'trade-id'
                }
              ]
            }
          ],
          runtime: {
            maxEvents: 1
          }
        }),
        now: () => new Date('2026-06-29T12:00:00.000Z'),
        createSdk() {
          return {
            marketdataStream: {
              marketDataStream(requests) {
                receivedRequests = collectRequests(requests);

                return responses({
                  trade: {
                    instrumentUid: 'trade-id'
                  }
                } as MarketDataResponse);
              },
              marketDataServerSideStream: createUnusedStream('marketDataServerSideStream')
            },
            operationsStream: {
              portfolioStream: createUnusedStream('portfolioStream'),
              positionsStream: createUnusedStream('positionsStream')
            },
            ordersStream: {
              tradesStream: createUnusedStream('tradesStream')
            },
            // Тестовый SDK не владеет ресурсами.
            // oxlint-disable-next-line no-empty-function
            close() {}
          };
        }
      });

      const output = await commandFacade.run(
        command,
        [
          'stream',
          'run',
          '--config=stream.json',
          '--token=token',
          '--endpoint=localhost:50051'
        ],
        undefined
      );

      const result = await collectOutput(output);

      if (receivedRequests === undefined) {
        throw new Error('Expected marketDataStream to receive initial requests');
      }

      assert.deepEqual(await receivedRequests, [
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
        }
      ]);
      assert.deepEqual(JSON.parse(result.trim()), {
        stream: 'marketdata.marketDataStream',
        sequence: 1,
        receivedAt: '2026-06-29T12:00:00.000Z',
        type: 'trade',
        payload: {
          instrumentUid: 'trade-id'
        }
      });
    });
  });
});
