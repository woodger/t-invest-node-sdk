import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type {
  TInvestUnaryLimitContext,
  TInvestUnaryLimiter,
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
    const granted: number[] = [];

    await withControlledTimers(async (clock) => {
      const acquired = recordPermit(limiter, ordersQuota, clock, granted);

      await clock.advanceTo(0);
      assert.deepEqual(granted, [0]);
      await acquired;
    });
  });

  test('spaces permits evenly within the original quota window', async () => {
    const limiter = createInMemoryUnaryLimiter();
    const granted: number[] = [];

    await withControlledTimers(async (clock) => {
      await recordPermit(limiter, ordersQuota, clock, granted);

      const second = recordPermit(limiter, ordersQuota, clock, granted);

      await clock.advanceTo(599);
      assert.deepEqual(granted, [0]);

      await clock.advanceTo(600);
      assert.deepEqual(granted, [0, 600]);
      await second;

      const methodQuota: TInvestUnaryQuota = {
        bucket: 'rule:OrdersService/PostOrder',
        maxRequests: 15,
        windowMs: 1_000
      };

      await recordPermit(limiter, methodQuota, clock, granted);

      const fourth = recordPermit(limiter, methodQuota, clock, granted);

      await clock.advanceTo(666);
      assert.deepEqual(granted, [0, 600, 600]);

      await clock.advanceTo(667);
      assert.deepEqual(granted, [0, 600, 600, 667]);
      await fourth;
    });
  });

  test(
    'preserves a fractional source quota without a reduced share',
    async () => {
      const limiter = createInMemoryUnaryLimiter();
      const quota: TInvestUnaryQuota = {
        bucket: 'rule:FractionalLimitService',
        maxRequests: 0.5,
        windowMs: 1_000
      };
      const granted: number[] = [];

      await withControlledTimers(async (clock) => {
        await recordPermit(limiter, quota, clock, granted);

        const following = recordPermit(limiter, quota, clock, granted);

        await clock.advanceTo(1_999);
        assert.deepEqual(granted, [0]);

        await clock.advanceTo(2_000);
        assert.deepEqual(granted, [0, 2_000]);
        await following;
      });
    }
  );

  test('limits permits to the configured quota share', async () => {
    const limiter = createInMemoryUnaryLimiter({ quotaShare: 0.5 });
    const marketQuota: TInvestUnaryQuota = {
      bucket: 'rule:MarketDataService',
      maxRequests: 600,
      windowMs: 60_000
    };
    const reportQuota: TInvestUnaryQuota = {
      bucket: 'quota:OperationsService:reports',
      maxRequests: 5,
      windowMs: 60_000
    };
    const granted: number[] = [];

    await withControlledTimers(async (clock) => {
      await recordPermit(limiter, marketQuota, clock, granted);

      const marketCall = recordPermit(limiter, marketQuota, clock, granted);

      await clock.advanceTo(199);
      assert.deepEqual(granted, [0]);

      await clock.advanceTo(200);
      assert.deepEqual(granted, [0, 200]);
      await marketCall;

      await recordPermit(limiter, reportQuota, clock, granted);

      const reportCall = recordPermit(limiter, reportQuota, clock, granted);

      await clock.advanceTo(30_199);
      assert.deepEqual(granted, [0, 200, 200]);

      await clock.advanceTo(30_200);
      assert.deepEqual(granted, [0, 200, 200, 30_200]);
      await reportCall;
    });
  });

  test('rejects an invalid quota share', () => {
    for (
      const quotaShare of [
        Number.NaN,
        Number.POSITIVE_INFINITY,
        -0.5,
        0,
        0.1,
        1.1
      ]
    ) {
      assert.throws(
        () => createInMemoryUnaryLimiter({ quotaShare }),
        /quotaShare must be a finite number between 0.2 and 1/
      );
    }
  });

  test(
    'paces a scaled quota below one permit over a longer interval',
    async () => {
      const limiter = createInMemoryUnaryLimiter({ quotaShare: 0.2 });
      const quota: TInvestUnaryQuota = {
        bucket: 'rule:VeryLowLimitService',
        maxRequests: 1,
        windowMs: 60_000
      };
      const granted: number[] = [];

      await withControlledTimers(async (clock) => {
        await recordPermit(limiter, quota, clock, granted);

        const following = recordPermit(limiter, quota, clock, granted);

        await clock.advanceTo(299_999);
        assert.deepEqual(granted, [0]);

        await clock.advanceTo(300_000);
        assert.deepEqual(granted, [0, 300_000]);
        await following;
      });
    }
  );

  test('does not delay independent buckets', async () => {
    const limiter = createInMemoryUnaryLimiter();
    const granted: number[] = [];

    await withControlledTimers(async (clock) => {
      await recordPermit(
        limiter,
        {
          bucket: 'quota:OperationsService:reports',
          maxRequests: 5,
          windowMs: 60_000
        },
        clock,
        granted
      );

      const independent = recordPermit(
        limiter,
        {
          bucket: 'rule:MarketDataService',
          maxRequests: 600,
          windowMs: 60_000
        },
        clock,
        granted
      );

      await clock.advanceTo(0);
      assert.deepEqual(granted, [0, 0]);
      await independent;
    });
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
    const granted: number[] = [];

    await withControlledTimers(async (clock) => {
      const acquired = Promise.all([
        recordPermit(limiter, ordersQuota, clock, granted),
        recordPermit(limiter, ordersQuota, clock, granted),
        recordPermit(limiter, ordersQuota, clock, granted)
      ]);

      await clock.advanceTo(599);
      assert.deepEqual(granted, [0]);

      await clock.advanceTo(600);
      assert.deepEqual(granted, [0, 600]);

      await clock.advanceTo(1_199);
      assert.deepEqual(granted, [0, 600]);

      await clock.advanceTo(1_200);
      assert.deepEqual(granted, [0, 600, 1_200]);
      await acquired;
    });
  });

  test(
    'starts the next interval when a permit is actually granted',
    async () => {
      const limiter = createInMemoryUnaryLimiter();
      const granted: number[] = [];

      await withControlledTimers(async (clock) => {
        await recordPermit(limiter, ordersQuota, clock, granted);

        const delayedCall = recordPermit(limiter, ordersQuota, clock, granted);
        const followingCall = recordPermit(
          limiter,
          ordersQuota,
          clock,
          granted
        );

        clock.setCurrentTime(2_000);
        await clock.advanceTo(2_000);
        assert.deepEqual(granted, [0, 2_000]);
        await delayedCall;

        await clock.advanceTo(2_599);
        assert.deepEqual(granted, [0, 2_000]);

        await clock.advanceTo(2_600);
        assert.deepEqual(granted, [0, 2_000, 2_600]);
        await followingCall;
      });
    }
  );

  test('removes a cancelled wait from the queue', async () => {
    const limiter = createInMemoryUnaryLimiter();
    const cancellationReason = new Error('cancelled');
    const granted: number[] = [];

    await withControlledTimers(async (clock) => {
      await recordPermit(limiter, ordersQuota, clock, granted);

      const controller = new AbortController();
      const cancelled = assert.rejects(
        limiter.acquire(createContext(ordersQuota, controller.signal)),
        (error: unknown) => error === cancellationReason
      );
      const followingCall = recordPermit(limiter, ordersQuota, clock, granted);

      controller.abort(cancellationReason);
      await cancelled;

      await clock.advanceTo(599);
      assert.deepEqual(granted, [0]);

      await clock.advanceTo(600);
      assert.deepEqual(granted, [0, 600]);
      await followingCall;
    });
  });

  test('does not reserve a permit for an already aborted call', async () => {
    const limiter = createInMemoryUnaryLimiter();
    const controller = new AbortController();
    const cancellationReason = new Error('cancelled');
    const granted: number[] = [];

    controller.abort(cancellationReason);

    await withControlledTimers(async (clock) => {
      await assert.rejects(
        limiter.acquire(createContext(ordersQuota, controller.signal)),
        (error: unknown) => error === cancellationReason
      );

      const following = recordPermit(limiter, ordersQuota, clock, granted);

      await clock.advanceTo(0);
      assert.deepEqual(granted, [0]);
      await following;
    });
  });

  test('compacts queued permits after a later call is aborted', async () => {
    const limiter = createInMemoryUnaryLimiter();
    const controller = new AbortController();
    const cancellationReason = new Error('cancelled');
    const granted: number[] = [];

    await withControlledTimers(async (clock) => {
      await recordPermit(limiter, ordersQuota, clock, granted);

      const waitingCall = recordPermit(limiter, ordersQuota, clock, granted);
      const cancelled = assert.rejects(
        limiter.acquire(createContext(ordersQuota, controller.signal)),
        (error: unknown) => error === cancellationReason
      );
      const followingCall = recordPermit(limiter, ordersQuota, clock, granted);

      controller.abort(cancellationReason);
      await cancelled;

      await clock.advanceTo(600);
      assert.deepEqual(granted, [0, 600]);
      await waitingCall;

      await clock.advanceTo(1_199);
      assert.deepEqual(granted, [0, 600]);

      await clock.advanceTo(1_200);
      assert.deepEqual(granted, [0, 600, 1_200]);
      await followingCall;
    });
  });

  test(
    'preserves FIFO when queued waits are cancelled in reverse order',
    async () => {
      const limiter = createInMemoryUnaryLimiter();
      const cancellationReason = new Error('cancelled');
      const granted: number[] = [];

      await withControlledTimers(async (clock) => {
        await limiter.acquire(createContext(ordersQuota));

        const waiting = Array.from({ length: 8 }, (_, index) => {
          const controller = new AbortController();
          const acquired = limiter.acquire(
            createContext(ordersQuota, controller.signal)
          )
            .then(
              () => {
                granted.push(index);
              },
              (error: unknown) => {
                assert.equal(error, cancellationReason);
              }
            );

          return { index, controller, acquired };
        });
        const cancelled = waiting.filter(({ index }) => index % 2 === 1)
          .reverse();

        for (const wait of cancelled) {
          wait.controller.abort(cancellationReason);
        }

        await Promise.all(cancelled.map(({ acquired }) => acquired));
        await clock.advanceTo(2_400);
        assert.deepEqual(granted, [0, 2, 4, 6]);
        await Promise.all(waiting.map(({ acquired }) => acquired));
      });
    }
  );

  test(
    'preserves bucket pacing after every queued wait is cancelled',
    async () => {
      const limiter = createInMemoryUnaryLimiter();
      const cancellationReason = new Error('cancelled');
      const granted: number[] = [];

      await withControlledTimers(async (clock) => {
        await recordPermit(limiter, ordersQuota, clock, granted);

        const controllers = Array.from(
          { length: 3 },
          () => new AbortController()
        );
        const cancelled = controllers.map((controller) =>
          assert.rejects(
            limiter.acquire(createContext(ordersQuota, controller.signal)),
            (error: unknown) => error === cancellationReason
          )
        );

        for (const controller of controllers.reverse()) {
          controller.abort(cancellationReason);
        }

        await Promise.all(cancelled);
        clock.setCurrentTime(100);

        const replacement = recordPermit(limiter, ordersQuota, clock, granted);

        await clock.advanceTo(599);
        assert.deepEqual(granted, [0]);

        await clock.advanceTo(600);
        assert.deepEqual(granted, [0, 600]);
        await replacement;

        const following = recordPermit(limiter, ordersQuota, clock, granted);

        await clock.advanceTo(1_199);
        assert.deepEqual(granted, [0, 600]);

        await clock.advanceTo(1_200);
        assert.deepEqual(granted, [0, 600, 1_200]);
        await following;
      });
    }
  );

  test(
    'keeps waits beyond the Node.js timer range pending for the full interval',
    async () => {
      const limiter = createInMemoryUnaryLimiter();
      const maxTimerDelayMs = 2_147_483_647;
      const interval = maxTimerDelayMs + 10;
      const quota: TInvestUnaryQuota = {
        bucket: 'rule:VeryLowLimitService',
        maxRequests: 1,
        windowMs: interval
      };
      const granted: number[] = [];

      await withControlledTimers(async (clock) => {
        await recordPermit(limiter, quota, clock, granted);

        const waitingCall = recordPermit(limiter, quota, clock, granted);

        assert.ok(clock.delays.length > 0);
        assert.ok(
          clock.delays.every((delay) => delay > 0 && delay <= maxTimerDelayMs)
        );

        await clock.advanceTo(interval - 1);
        assert.deepEqual(granted, [0]);
        assert.ok(
          clock.delays.every((delay) => delay > 0 && delay <= maxTimerDelayMs)
        );

        await clock.advanceTo(interval);
        assert.deepEqual(granted, [0, interval]);
        await waitingCall;
      });
    }
  );
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

function recordPermit(
  limiter: TInvestUnaryLimiter,
  quota: TInvestUnaryQuota,
  clock: ControlledTimers,
  granted: number[]
): Promise<void> {
  return limiter.acquire(createContext(quota)).then(() => {
    granted.push(clock.now());
  });
}

interface ControlledTimers {
  delays: number[];
  now(): number;
  advanceTo(value: number): Promise<void>;
  setCurrentTime(value: number): void;
}

async function withControlledTimers(
  run: (timers: ControlledTimers) => Promise<void>
): Promise<void> {
  const originalPerformance = global.performance;
  const originalSetTimeout = global.setTimeout;
  const originalClearTimeout = global.clearTimeout;
  let now = 0;
  const delays: number[] = [];
  const callbacks = new Map<number, {
    callback: () => void;
    dueAt: number;
  }>();
  let nextTimer = 1;

  global.performance = { now: () => now } as Performance;
  global.setTimeout =
    ((callback: (...args: unknown[]) => void, delay?: number) => {
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
      now: () => now,
      async advanceTo(value) {
        assert.ok(value >= now);
        await flushPromises();

        while (true) {
          let next: {
            timer: number;
            callback: () => void;
            dueAt: number;
          } | undefined;

          for (const [timer, scheduled] of callbacks) {
            if (
              scheduled.dueAt <= value
              && (next === undefined || scheduled.dueAt < next.dueAt)
            ) {
              next = { timer, ...scheduled };
            }
          }

          if (next === undefined) {
            break;
          }

          callbacks.delete(next.timer);
          now = Math.max(now, next.dueAt);
          next.callback();
          await flushPromises();
        }

        now = value;
        await flushPromises();
      },
      setCurrentTime(value) {
        assert.ok(value >= now);
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

async function flushPromises(): Promise<void> {
  await new Promise<void>((resolve) => setImmediate(resolve));
}
