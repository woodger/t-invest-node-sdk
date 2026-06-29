import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  PortfolioStreamRequest,
  PortfolioStreamResponse
} from '../../../generated/operations';
import type { TradesStreamResponse } from '../../../generated/orders';
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

function createUnusedStream(name: string) {
  return () => {
    throw new Error(`${name} should not be called`);
  };
}

describe('stream run command', () => {
  describe('createStreamRunCommand', () => {
    test('runs operations portfolio stream and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
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
              marketDataServerSideStream: createUnusedStream('marketDataServerSideStream')
            },
            operationsStream: {
              portfolioStream(request) {
                receivedRequest = request;

                return responses({
                  portfolio: {
                    accountId: 'account-id'
                  }
                } as unknown as PortfolioStreamResponse);
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

      const output = await runCommand(
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
        accounts: ['account-id']
      });
      assert.equal(closeCalls, 1);
      assert.deepEqual(JSON.parse(lines[0]), {
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
                  } as unknown as TradesStreamResponse,
                  {
                    orderTrades: {
                      orderId: 'order-id'
                    }
                  } as unknown as TradesStreamResponse
                );
              }
            },
            close() {}
          };
        }
      });

      const output = await runCommand(
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

    test('rejects invalid config before sdk creation', async () => {
      let createSdkCalls = 0;
      const command = createStreamRunCommand({
        readConfig: async () => JSON.stringify({
          stream: 'marketdata.marketDataStream',
          rawRequests: []
        }),
        createSdk() {
          createSdkCalls += 1;

          throw new Error('sdk should not be created');
        }
      });

      await assert.rejects(
        () => runCommand(
          command,
          [
            'stream',
            'run',
            '--config=stream.json'
          ],
          undefined
        ),
        /marketdata\.marketDataStream' is not supported/
      );
      assert.equal(createSdkCalls, 0);
    });
  });
});
