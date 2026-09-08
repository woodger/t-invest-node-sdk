import assert from 'node:assert';
import { describe, test } from 'node:test';
import type {
  TInvestUnaryLimitContext,
  TInvestUnaryQuota
} from './unary-limiter';
import { createInMemoryUnaryLimiter } from './unary-limiter';

const passiveSignal = new AbortController().signal;
const ordersQuota: TInvestUnaryQuota = {
  bucket: 'rule:OrdersService',
  maxRequests: 100,
  windowMs: 60_000
};

describe('createInMemoryUnaryLimiter', () => {
  test('grants the first permit without waiting', async () => {
    const limiter = createInMemoryUnaryLimiter();

    const delays = await captureDelays(async () => {
      await limiter.acquire(createContext(ordersQuota));
    });

    assert.deepEqual(delays, []);
  });

  test('spaces permits evenly within the original quota window', async () => {
    const limiter = createInMemoryUnaryLimiter();

    const delays = await captureDelays(async () => {
      await limiter.acquire(createContext(ordersQuota));
      await limiter.acquire(createContext(ordersQuota));
      await limiter.acquire(createContext({
        bucket: 'rule:OrdersService/PostOrder',
        maxRequests: 15,
        windowMs: 1_000
      }));
      await limiter.acquire(createContext({
        bucket: 'rule:OrdersService/PostOrder',
        maxRequests: 15,
        windowMs: 1_000
      }));
    });

    assert.deepEqual(delays, [600, 67]);
  });

  test('does not delay independent buckets', async () => {
    const limiter = createInMemoryUnaryLimiter();

    const delays = await captureDelays(async () => {
      await limiter.acquire(createContext({
        bucket: 'quota:OperationsService:reports',
        maxRequests: 5,
        windowMs: 60_000
      }));
      await limiter.acquire(createContext({
        bucket: 'rule:MarketDataService',
        maxRequests: 600,
        windowMs: 60_000
      }));
    });

    assert.deepEqual(delays, []);
  });

  test('rejects conflicting quotas for one bucket', async () => {
    const limiter = createInMemoryUnaryLimiter();

    await limiter.acquire(createContext(ordersQuota));

    await assert.rejects(
      limiter.acquire(createContext({
        ...ordersQuota,
        maxRequests: 50
      })),
      /Conflicting quota for bucket rule:OrdersService/
    );
  });

  test('reserves sequential permits for concurrent calls', async () => {
    const limiter = createInMemoryUnaryLimiter();

    const delays = await captureDelays(async () => {
      await Promise.all([
        limiter.acquire(createContext(ordersQuota)),
        limiter.acquire(createContext(ordersQuota)),
        limiter.acquire(createContext(ordersQuota))
      ]);
    });

    assert.deepEqual(delays, [600, 600]);
  });

  test('starts the next interval when a permit is actually granted', async () => {
    const limiter = createInMemoryUnaryLimiter();

    await withControlledTimers(async ({ delays, runNext, setCurrentTime }) => {
      await limiter.acquire(createContext(ordersQuota));

      const delayedCall = limiter.acquire(createContext(ordersQuota));
      let followingCallSettled = false;
      const followingCall = limiter.acquire(createContext(ordersQuota))
        .finally(() => {
          followingCallSettled = true;
        });

      assert.deepEqual(delays, [600]);

      setCurrentTime(12_000);
      runNext();
      await delayedCall;
      await Promise.resolve();

      assert.equal(followingCallSettled, false);
      assert.deepEqual(delays, [600, 600]);

      setCurrentTime(12_600);
      runNext();
      await followingCall;
    });
  });

  test('removes a cancelled wait from the queue', async () => {
    const limiter = createInMemoryUnaryLimiter();
    const cancellationReason = new Error('cancelled');

    await withControlledTimers(async ({ delays, runNext }) => {
      await limiter.acquire(createContext(ordersQuota));

      const controller = new AbortController();
      const cancelledCall = limiter.acquire(
        createContext(ordersQuota, controller.signal)
      );
      const followingCall = limiter.acquire(createContext(ordersQuota));

      controller.abort(cancellationReason);

      await assert.rejects(
        cancelledCall,
        (error: unknown) => error === cancellationReason
      );
      assert.deepEqual(delays, [600, 600]);

      runNext();
      await followingCall;
    });
  });

  test('does not reserve a permit for an already aborted call', async () => {
    const limiter = createInMemoryUnaryLimiter();
    const controller = new AbortController();
    const cancellationReason = new Error('cancelled');

    controller.abort(cancellationReason);

    const delays = await captureDelays(async () => {
      await assert.rejects(
        limiter.acquire(createContext(ordersQuota, controller.signal)),
        (error: unknown) => error === cancellationReason
      );
      await limiter.acquire(createContext(ordersQuota));
    });

    assert.deepEqual(delays, []);
  });

  test('compacts queued permits after a later call is aborted', async () => {
    const limiter = createInMemoryUnaryLimiter();
    const controller = new AbortController();
    const cancellationReason = new Error('cancelled');

    await withControlledTimers(async ({ delays, runNext }) => {
      await limiter.acquire(createContext(ordersQuota));

      const waitingCall = limiter.acquire(createContext(ordersQuota));
      const cancelledCall = limiter.acquire(
        createContext(ordersQuota, controller.signal)
      );
      const followingCall = limiter.acquire(createContext(ordersQuota));

      controller.abort(cancellationReason);

      await assert.rejects(
        cancelledCall,
        (error: unknown) => error === cancellationReason
      );
      assert.deepEqual(delays, [600]);

      runNext();
      await waitingCall;
      assert.deepEqual(delays, [600, 600]);

      runNext();
      await followingCall;
    });
  });

  test('splits a wait beyond the Node.js timer range', async () => {
    const limiter = createInMemoryUnaryLimiter();
    const maxTimerDelayMs = 2_147_483_647;
    const interval = maxTimerDelayMs + 10;
    const quota: TInvestUnaryQuota = {
      bucket: 'rule:VeryLowLimitService',
      maxRequests: 1,
      windowMs: interval
    };

    await withControlledTimers(async ({
      delays,
      runNext,
      setCurrentTime
    }) => {
      await limiter.acquire(createContext(quota));

      const waitingCall = limiter.acquire(createContext(quota));

      assert.deepEqual(delays, [maxTimerDelayMs]);

      setCurrentTime(10_000 + maxTimerDelayMs);
      runNext();
      assert.deepEqual(delays, [maxTimerDelayMs, 10]);

      setCurrentTime(10_000 + interval);
      runNext();
      await waitingCall;
    });
  });
});

function createContext(
  quota: TInvestUnaryQuota,
  signal: AbortSignal = passiveSignal
): TInvestUnaryLimitContext {
  return {
    path: '/test.Service/Method',
    quota,
    signal
  };
}

async function captureDelays(run: () => Promise<void>): Promise<number[]> {
  const originalPerformance = global.performance;
  const originalSetTimeout = global.setTimeout;
  let now = 10_000;
  const delays: number[] = [];

  global.performance = { now: () => now } as Performance;
  global.setTimeout = ((callback: (...args: unknown[]) => void, delay?: number) => {
    const resolvedDelay = delay ?? 0;

    delays.push(resolvedDelay);
    now += resolvedDelay;
    callback();

    return 0 as never;
  }) as unknown as typeof setTimeout;

  try {
    await run();

    return delays;
  }
  finally {
    global.performance = originalPerformance;
    global.setTimeout = originalSetTimeout;
  }
}

interface ControlledTimers {
  delays: number[];
  runNext(): void;
  setCurrentTime(value: number): void;
}

async function withControlledTimers(
  run: (timers: ControlledTimers) => Promise<void>
): Promise<void> {
  const originalPerformance = global.performance;
  const originalSetTimeout = global.setTimeout;
  const originalClearTimeout = global.clearTimeout;
  let now = 10_000;
  const delays: number[] = [];
  const callbacks = new Map<number, {
    callback: () => void;
    dueAt: number;
  }>();
  let nextTimer = 1;

  global.performance = { now: () => now } as Performance;
  global.setTimeout = ((callback: (...args: unknown[]) => void, delay?: number) => {
    const timer = nextTimer;

    nextTimer += 1;
    delays.push(delay ?? 0);
    callbacks.set(timer, {
      callback,
      dueAt: now + (delay ?? 0)
    });

    return timer as never;
  }) as unknown as typeof setTimeout;
  global.clearTimeout = ((timer: ReturnType<typeof setTimeout>) => {
    callbacks.delete(Number(timer));
  }) as typeof clearTimeout;

  try {
    await run({
      delays,
      runNext() {
        const entry = callbacks.entries().next().value;

        assert.notEqual(entry, undefined);

        const [timer, scheduled] = entry as [
          number,
          { callback: () => void; dueAt: number }
        ];

        callbacks.delete(timer);
        now = Math.max(now, scheduled.dueAt);
        scheduled.callback();
      },
      setCurrentTime(value) {
        now = value;
      }
    });
  }
  finally {
    global.performance = originalPerformance;
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
  }
}
