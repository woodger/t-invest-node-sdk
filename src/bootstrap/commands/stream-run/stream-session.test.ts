import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { createServer } from 'nice-grpc';
import { ResultSubscriptionStatus } from '../../../generated/common';
import {
  OperationsStreamServiceDefinition,
  type PortfolioStreamResponse
} from '../../../generated/operations';
import {
  OrdersStreamServiceDefinition,
  type TradesStreamResponse
} from '../../../generated/orders';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import type { StreamRunConfig, StreamRunRuntime } from './config';
import {
  runStreamRunSession,
  type StreamRunSdk
} from './stream-session';

async function collectOutput(output: AsyncIterable<string>): Promise<string> {
  let result = '';

  for await (const chunk of output) {
    result += chunk;
  }

  return result;
}

function waitUntilAborted(signal: AbortSignal): Promise<never> {
  return new Promise<never>((resolve, reject) => {
    void resolve;

    const rejectWithReason = () => {
      reject(
        signal.reason instanceof Error
          ? signal.reason
          : new Error('stream aborted')
      );
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

async function* responsesThenError<T>(error: unknown): AsyncIterable<T> {
  const responses: T[] = [];

  for (const response of responses) {
    yield response;
  }

  throw error;
}

function createUnusedStream(name: string) {
  return () => {
    throw new Error(`${name} should not be called`);
  };
}

interface TestSdkOverrides {
  readonly portfolioStream?: StreamRunSdk['operationsStream']['portfolioStream'];
  readonly tradesStream?: StreamRunSdk['ordersStream']['tradesStream'];
  readonly close?: () => void;
}

function createTestSdk(overrides: TestSdkOverrides): StreamRunSdk {
  return {
    marketdataStream: {
      marketDataStream: createUnusedStream('marketDataStream'),
      marketDataServerSideStream: createUnusedStream('marketDataServerSideStream')
    },
    operationsStream: {
      portfolioStream: overrides.portfolioStream ?? createUnusedStream('portfolioStream'),
      positionsStream: createUnusedStream('positionsStream')
    },
    ordersStream: {
      tradesStream: overrides.tradesStream ?? createUnusedStream('tradesStream')
    },
    close: overrides.close ?? (() => {
      // Тестовый SDK не владеет ресурсами.
    })
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

const sdkOptions = {
  token: 'token',
  endpoint: 'localhost:50051'
} as const;

const defaultRuntime: StreamRunRuntime = {
  format: 'jsonl',
  includePings: false,
  includeSubscriptionEvents: true,
  raw: false
};

describe('runStreamRunSession', () => {
  test('counts trade events after filtering a real gRPC subscription acknowledgement', async () => {
    const server = createServer();

    server.add(OrdersStreamServiceDefinition, {
      async *tradesStream() {
        yield {
          subscription: {
            trackingId: 'tracking-id',
            status: ResultSubscriptionStatus.RESULT_SUBSCRIPTION_STATUS_OK,
            streamId: 'stream-id',
            accounts: ['account-id']
          }
        };
        yield { orderTrades: { orderId: 'first-order' } };
        yield { orderTrades: { orderId: 'second-order' } };
      },
      orderStateStream: createUnusedStream('orderStateStream')
    });

    const port = await server.listen('127.0.0.1:0');
    const options = {
      token: 'token',
      endpoint: `127.0.0.1:${port}`,
      useSsl: false
    };
    const sdk = new TInvestNodeSDK(options);
    const runtime = {
      ...defaultRuntime,
      includeSubscriptionEvents: false,
      maxEvents: 1
    };
    const config: StreamRunConfig = {
      stream: 'orders.tradesStream',
      accounts: ['account-id'],
      runtime
    };

    try {
      const output = runStreamRunSession(config, runtime, options, {
        createSdk: () => sdk,
        now: () => new Date(),
        elapsedNow: () => performance.now()
      });
      const rendered = await withDeadline(collectOutput(output), 5_000);

      assert.equal(rendered.trim().split('\n').length, 1);
      assert.equal(JSON.parse(rendered).type, 'orderTrades');
      assert.equal(JSON.parse(rendered).sequence, 1);
      assert.equal(JSON.parse(rendered).payload.orderId, 'first-order');
    }
    finally {
      sdk.close();
      await server.shutdown();
    }
  });

  test('completes a real gRPC stream after maxEvents without a cancellation error', async () => {
    const server = createServer();

    server.add(OperationsStreamServiceDefinition, {
      async *portfolioStream() {
        yield { portfolio: { accountId: 'first-account' } };
        yield { portfolio: { accountId: 'second-account' } };
      },
      positionsStream: createUnusedStream('positionsStream'),
      operationsStream: createUnusedStream('operationsStream')
    });

    const port = await server.listen('127.0.0.1:0');
    const options = {
      token: 'token',
      endpoint: `127.0.0.1:${port}`,
      useSsl: false
    };
    const sdk = new TInvestNodeSDK(options);
    const runtime = { ...defaultRuntime, maxEvents: 1 };
    const config: StreamRunConfig = {
      stream: 'operations.portfolioStream',
      accounts: ['first-account'],
      runtime
    };

    try {
      const output = runStreamRunSession(config, runtime, options, {
        createSdk: () => sdk,
        now: () => new Date(),
        elapsedNow: () => performance.now()
      });
      const rendered = await withDeadline(collectOutput(output), 5_000);

      assert.equal(rendered.trim().split('\n').length, 1);
      assert.match(rendered, /"accountId":"first-account"/);
    }
    finally {
      sdk.close();
      await server.shutdown();
    }
  });

  test('отменяет silent stream по duration и закрывает SDK', async () => {
    const config: StreamRunConfig = {
      stream: 'orders.tradesStream',
      accounts: ['account-id'],
      runtime: defaultRuntime
    };
    let receivedSignal: AbortSignal | undefined;
    let closeCalls = 0;
    const output = runStreamRunSession(
      config,
      { ...defaultRuntime, durationMs: 10 },
      sdkOptions,
      {
        createSdk: () => createTestSdk({
          tradesStream(_request, options) {
            const signal = options?.signal;

            if (signal === undefined) {
              throw new Error('Expected stream AbortSignal');
            }

            receivedSignal = signal;

            return responsesUntilAborted<TradesStreamResponse>([], signal);
          },
          close() {
            closeCalls += 1;
          }
        }),
        now: () => new Date(),
        elapsedNow: () => performance.now()
      }
    );

    assert.equal(await withDeadline(collectOutput(output)), '');
    assert.equal(receivedSignal?.aborted, true);
    assert.equal(closeCalls, 1);
  });

  test('отменяет quiet stream по idle timeout после последнего события', async () => {
    const config: StreamRunConfig = {
      stream: 'operations.portfolioStream',
      accounts: ['account-id'],
      runtime: defaultRuntime
    };
    let receivedSignal: AbortSignal | undefined;
    let closeCalls = 0;
    const output = runStreamRunSession(
      config,
      { ...defaultRuntime, idleTimeoutMs: 10 },
      sdkOptions,
      {
        createSdk: () => createTestSdk({
          portfolioStream(_request, options) {
            const signal = options?.signal;

            if (signal === undefined) {
              throw new Error('Expected stream AbortSignal');
            }

            receivedSignal = signal;

            return responsesUntilAborted(
              [{ portfolio: { accountId: 'account-id' } } as PortfolioStreamResponse],
              signal
            );
          },
          close() {
            closeCalls += 1;
          }
        }),
        now: () => new Date('2026-06-29T12:00:00.000Z'),
        elapsedNow: () => performance.now()
      }
    );
    const rendered = await withDeadline(collectOutput(output));

    assert.deepEqual(JSON.parse(rendered.trim()), {
      stream: 'operations.portfolioStream',
      sequence: 1,
      receivedAt: '2026-06-29T12:00:00.000Z',
      type: 'portfolio',
      payload: { accountId: 'account-id' }
    });
    assert.equal(receivedSignal?.aborted, true);
    assert.equal(closeCalls, 1);
  });

  test('разбивает duration больше диапазона Node.js timer', async () => {
    const maxTimerDelayMs = 2_147_483_647;
    const durationMs = maxTimerDelayMs + 10;
    const originalSetTimeout = global.setTimeout;
    const originalClearTimeout = global.clearTimeout;
    const delays: number[] = [];
    const callbacks = new Map<number, () => void>();
    let elapsed = 0;
    let nextTimer = 1;
    let closeCalls = 0;

    global.setTimeout = ((callback: (...args: unknown[]) => void, delay?: number) => {
      const timer = nextTimer;

      nextTimer += 1;
      delays.push(delay ?? 0);
      callbacks.set(timer, callback);

      return timer as never;
    }) as unknown as typeof setTimeout;
    global.clearTimeout = ((timer: ReturnType<typeof setTimeout>) => {
      callbacks.delete(Number(timer));
    }) as typeof clearTimeout;

    try {
      const config: StreamRunConfig = {
        stream: 'orders.tradesStream',
        accounts: ['account-id'],
        runtime: defaultRuntime
      };
      const output = runStreamRunSession(
        config,
        { ...defaultRuntime, durationMs },
        sdkOptions,
        {
          createSdk: () => createTestSdk({
            tradesStream(_request, options) {
              const signal = options?.signal;

              if (signal === undefined) {
                throw new Error('Expected stream AbortSignal');
              }

              return responsesUntilAborted<TradesStreamResponse>([], signal);
            },
            close() {
              closeCalls += 1;
            }
          }),
          now: () => new Date(),
          elapsedNow: () => elapsed
        }
      );
      const completion = collectOutput(output);

      await new Promise<void>((resolve) => setImmediate(resolve));
      assert.deepEqual(delays, [maxTimerDelayMs]);

      elapsed = maxTimerDelayMs;
      runNextTimer(callbacks);
      assert.deepEqual(delays, [maxTimerDelayMs, 10]);

      elapsed = durationMs;
      runNextTimer(callbacks);
      assert.equal(await completion, '');
      assert.equal(closeCalls, 1);
    }
    finally {
      global.setTimeout = originalSetTimeout;
      global.clearTimeout = originalClearTimeout;
    }
  });

  test('не маскирует provider error, полученную до timeout', async () => {
    const providerError = new Error('provider failed');
    const config: StreamRunConfig = {
      stream: 'orders.tradesStream',
      accounts: ['account-id'],
      runtime: defaultRuntime
    };
    let closeCalls = 0;
    const output = runStreamRunSession(
      config,
      { ...defaultRuntime, durationMs: 100 },
      sdkOptions,
      {
        createSdk: () => createTestSdk({
          tradesStream() {
            return responsesThenError<TradesStreamResponse>(providerError);
          },
          close() {
            closeCalls += 1;
          }
        }),
        now: () => new Date(),
        elapsedNow: () => performance.now()
      }
    );

    await assert.rejects(
      withDeadline(collectOutput(output)),
      (error: unknown) => error === providerError
    );
    assert.equal(closeCalls, 1);
  });
});

function runNextTimer(callbacks: Map<number, () => void>): void {
  const entry = callbacks.entries().next().value;

  assert.notEqual(entry, undefined);

  const [timer, callback] = entry as [number, () => void];

  callbacks.delete(timer);
  callback();
}
