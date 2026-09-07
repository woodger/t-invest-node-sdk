import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { ThrottleRule } from './unary-throttle.service';
import { Throttle } from './unary-throttle.service';

const ordersRule: ThrottleRule = {
  bucket: 'rule:OrdersService',
  limitPerMinute: 100
};

describe('Throttle', () => {
  test('does not wait on the first call for a bucket', async () => {
    const throttle = new Throttle();

    const delays = await captureThrottleDelays(async () => {
      await throttle.reduce(ordersRule);
    });

    assert.deepEqual(delays, []);
  });

  test('waits according to the resolved limit between calls', async () => {
    const throttle = new Throttle();

    const delays = await captureThrottleDelays(async () => {
      await throttle.reduce(ordersRule);
      await throttle.reduce(ordersRule);
    });

    assert.deepEqual(delays, [600]);
  });

  test('does not delay calls assigned to independent buckets', async () => {
    const throttle = new Throttle();

    const delays = await captureThrottleDelays(async () => {
      await throttle.reduce({
        bucket: 'quota:OperationsService:reports',
        limitPerMinute: 5
      });
      await throttle.reduce({
        bucket: 'rule:MarketDataService',
        limitPerMinute: 600
      });
    });

    assert.deepEqual(delays, []);
  });

  test('shares one schedule between calls assigned to the same quota bucket', async () => {
    const throttle = new Throttle();
    const sharedRule: ThrottleRule = {
      bucket: 'quota:OperationsService:reports',
      limitPerMinute: 5
    };

    const delays = await captureThrottleDelays(async () => {
      await throttle.reduce(sharedRule);
      await throttle.reduce(sharedRule);
    });

    assert.deepEqual(delays, [12000]);
  });

  test('reserves sequential slots for concurrent calls in one bucket', async () => {
    const throttle = new Throttle();

    const delays = await captureThrottleDelays(async () => {
      await Promise.all([
        throttle.reduce(ordersRule),
        throttle.reduce(ordersRule),
        throttle.reduce(ordersRule)
      ]);
    });

    assert.deepEqual(delays, [600, 600]);
  });

  test('preserves the interval after a delayed timer callback', async () => {
    const throttle = new Throttle();

    await withControlledThrottleTimers(async ({
      delays,
      runNext,
      setCurrentTime
    }) => {
      await throttle.reduce(ordersRule);

      const delayedCall = throttle.reduce(ordersRule);
      let followingCallSettled = false;
      const followingCall = throttle.reduce(ordersRule)
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

  test('releases a waiting slot when its signal is aborted', async () => {
    const throttle = new Throttle();
    const cancellationReason = new Error('cancelled');

    await withControlledThrottleTimers(async ({ delays, runNext }) => {
      await throttle.reduce(ordersRule);

      const controller = new AbortController();
      const cancelledCall = throttle.reduce(ordersRule, controller.signal);
      const followingCall = throttle.reduce(ordersRule);

      assert.deepEqual(delays, [600]);

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

  test('does not reserve a slot for an already aborted signal', async () => {
    const throttle = new Throttle();
    const controller = new AbortController();
    const cancellationReason = new Error('cancelled');

    controller.abort(cancellationReason);

    const delays = await captureThrottleDelays(async () => {
      await assert.rejects(
        throttle.reduce(ordersRule, controller.signal),
        (error: unknown) => error === cancellationReason
      );
      await throttle.reduce(ordersRule);
    });

    assert.deepEqual(delays, []);
  });

  test('compacts queued slots after a later call is aborted', async () => {
    const throttle = new Throttle();
    const cancellationReason = new Error('cancelled');

    await withControlledThrottleTimers(async ({ delays, runNext }) => {
      await throttle.reduce(ordersRule);

      const waitingCall = throttle.reduce(ordersRule);
      const controller = new AbortController();
      const cancelledCall = throttle.reduce(ordersRule, controller.signal);
      const followingCall = throttle.reduce(ordersRule);

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

  test('splits waits that exceed the Node.js timer range', async () => {
    const throttle = new Throttle();
    const maxTimerDelayMs = 2_147_483_647;
    const interval = maxTimerDelayMs + 10;
    const rule: ThrottleRule = {
      bucket: 'rule:VeryLowLimitService',
      limitPerMinute: 60_000 / interval
    };

    await withControlledThrottleTimers(async ({
      delays,
      runNext,
      setCurrentTime
    }) => {
      await throttle.reduce(rule);

      const waitingCall = throttle.reduce(rule);

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

async function captureThrottleDelays(run: () => Promise<void>): Promise<number[]> {
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

interface ControlledThrottleTimers {
  delays: number[];
  runNext(): void;
  setCurrentTime(value: number): void;
}

async function withControlledThrottleTimers(
  run: (timers: ControlledThrottleTimers) => Promise<void>
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
