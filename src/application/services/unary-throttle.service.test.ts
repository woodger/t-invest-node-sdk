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

    assert.deepEqual(delays, [600, 1200]);
  });
});

async function captureThrottleDelays(run: () => Promise<void>): Promise<number[]> {
  const originalDate = global.Date;
  const originalSetTimeout = global.setTimeout;
  const now = 10_000;
  const delays: number[] = [];

  class FakeDate extends Date {
    constructor(value?: string | number | Date) {
      super(value ?? now);
    }
  }

  global.Date = FakeDate as DateConstructor;
  global.setTimeout = ((callback: (...args: unknown[]) => void, delay?: number) => {
    delays.push(delay ?? 0);
    callback();

    return 0 as never;
  }) as unknown as typeof setTimeout;

  try {
    await run();

    return delays;
  }
  finally {
    global.Date = originalDate;
    global.setTimeout = originalSetTimeout;
  }
}
