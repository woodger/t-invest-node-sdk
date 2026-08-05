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

function waitUntilAborted(signal: AbortSignal): Promise<never> {
  return new Promise<never>((resolve, reject) => {
    void resolve;

    const rejectWithReason = () => {
      reject(signal.reason ?? new Error('stream aborted'));
    };

    if (signal.aborted) {
      rejectWithReason();

      return;
    }

    signal.addEventListener('abort', rejectWithReason, { once: true });
  });
}

async function* responsesUntilAborted<T>(
  responses: readonly T[],
  signal: AbortSignal
): AsyncIterable<T> {
  for (const response of responses) {
    yield response;
  }

  await waitUntilAborted(signal);
}

async function* responsesThenError<T>(
  responses: readonly T[],
  error: unknown
): AsyncIterable<T> {
  for (const response of responses) {
    yield response;
  }

  throw error;
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

async function withDeadline<T>(
  promise: Promise<T>,
  timeoutMs = 500
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((resolve, reject) => {
    void resolve;

    timeout = setTimeout(() => {
      reject(new Error(`Expected operation to finish within ${timeoutMs} ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, deadline]);
  }
  finally {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  }
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

    test('cancels a silent stream when session duration expires', async () => {
      let receivedSignal: AbortSignal | undefined;
      let closeCalls = 0;
      const command = createStreamRunCommand({
        readConfig: async () => JSON.stringify({
          stream: 'orders.tradesStream',
          accounts: ['account-id'],
          runtime: {
            durationMs: 10
          }
        }),
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
              tradesStream(request, options) {
                void request;

                const signal = options?.signal;

                if (signal === undefined) {
                  throw new Error('Expected stream AbortSignal');
                }

                receivedSignal = signal;

                return responsesUntilAborted<TradesStreamResponse>([], signal);
              }
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

      assert.equal(await withDeadline(collectOutput(output)), '');
      assert.equal(receivedSignal?.aborted, true);
      assert.equal(closeCalls, 1);
    });

    test('cancels a quiet stream when idle timeout expires', async () => {
      let receivedSignal: AbortSignal | undefined;
      let closeCalls = 0;
      const command = createStreamRunCommand({
        readConfig: async () => JSON.stringify({
          stream: 'operations.portfolioStream',
          accounts: ['account-id'],
          runtime: {
            idleTimeoutMs: 10
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
              portfolioStream(request, options) {
                void request;

                const signal = options?.signal;

                if (signal === undefined) {
                  throw new Error('Expected stream AbortSignal');
                }

                receivedSignal = signal;

                return responsesUntilAborted(
                  [{
                    portfolio: {
                      accountId: 'account-id'
                    }
                  } as PortfolioStreamResponse],
                  signal
                );
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
      const rendered = await withDeadline(collectOutput(output));

      assert.deepEqual(JSON.parse(rendered.trim()), {
        stream: 'operations.portfolioStream',
        sequence: 1,
        receivedAt: '2026-06-29T12:00:00.000Z',
        type: 'portfolio',
        payload: {
          accountId: 'account-id'
        }
      });
      assert.equal(receivedSignal?.aborted, true);
      assert.equal(closeCalls, 1);
    });

    test('does not mask a stream failure that precedes the timeout', async () => {
      const providerError = new Error('provider failed');
      let closeCalls = 0;
      const command = createStreamRunCommand({
        readConfig: async () => JSON.stringify({
          stream: 'orders.tradesStream',
          accounts: ['account-id'],
          runtime: {
            durationMs: 100
          }
        }),
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
                return responsesThenError<TradesStreamResponse>([], providerError);
              }
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

      await assert.rejects(
        withDeadline(collectOutput(output)),
        (error: unknown) => error === providerError
      );
      assert.equal(closeCalls, 1);
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
            // biome-ignore lint/suspicious/noEmptyBlockStatements: The test SDK owns no resources.
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
        (await collectOutput(output)).trim().split('\n').map((line) => JSON.parse(line)),
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
            // biome-ignore lint/suspicious/noEmptyBlockStatements: The test SDK owns no resources.
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
            // biome-ignore lint/suspicious/noEmptyBlockStatements: The test SDK owns no resources.
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
