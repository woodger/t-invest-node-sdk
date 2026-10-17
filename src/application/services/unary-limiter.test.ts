import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import type {
  TInvestUnaryLimitContext,
  TInvestUnaryLimiter,
  TInvestUnaryQuota
} from './unary-limiter';
import { createInMemoryUnaryLimiter } from './unary-limiter';

const passiveSignal = new AbortController().signal;
const minimumQuotaShare = 0.2;
const maximumQuotaShare = 1;
const halfQuotaShare = 0.5;
const minuteWindowMs = 60_000;
const secondWindowMs = 1_000;
const ordersRequestsPerMinute = 100;
const ordersPermitIntervalMs = minuteWindowMs / ordersRequestsPerMinute;
const postOrderRequestsPerSecond = 15;
const postOrderPermitIntervalMs = Math.ceil(
  secondWindowMs / postOrderRequestsPerSecond
);
const fractionalRequestsPerSecond = 0.5;
const fractionalPermitIntervalMs =
  secondWindowMs / fractionalRequestsPerSecond;
const marketDataRequestsPerMinute = 600;
const halfShareMarketRequestsPerMinute =
  marketDataRequestsPerMinute * halfQuotaShare;
const halfShareMarketPermitIntervalMs =
  minuteWindowMs / halfShareMarketRequestsPerMinute;
const reportsRequestsPerMinute = 5;
const halfShareReportsRequestsPerMinute = Math.floor(
  reportsRequestsPerMinute * halfQuotaShare
);
const halfShareReportsPermitIntervalMs =
  minuteWindowMs / halfShareReportsRequestsPerMinute;
const oneRequestPerMinute = 1;
const minimumSharePermitIntervalMs =
  minuteWindowMs / (oneRequestPerMinute * minimumQuotaShare);
const conflictingOrdersRequestsPerMinute = 50;
const queuedWaitCount = 8;
const cancelledWaitCount = 3;
const replacementRequestedAtMs = 100;
const delayedPermitAtMs = 2_000;
// Node.js принимает задержки setTimeout не больше 2^31 - 1 миллисекунд.
const maxTimerDelayMs = 2_147_483_647;
const timerRangeOverflowMs = 10;
const ordersQuota: TInvestUnaryQuota = {
  bucket: 'rule:OrdersService',
  maxRequests: ordersRequestsPerMinute,
  windowMs: minuteWindowMs
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

      await clock.advanceTo(ordersPermitIntervalMs - 1);
      assert.deepEqual(granted, [0]);

      await clock.advanceTo(ordersPermitIntervalMs);
      assert.deepEqual(granted, [0, ordersPermitIntervalMs]);
      await second;

      const methodQuota: TInvestUnaryQuota = {
        bucket: 'rule:OrdersService/PostOrder',
        maxRequests: postOrderRequestsPerSecond,
        windowMs: secondWindowMs
      };

      await recordPermit(limiter, methodQuota, clock, granted);

      const fourth = recordPermit(limiter, methodQuota, clock, granted);

      await clock.advanceTo(
        ordersPermitIntervalMs + postOrderPermitIntervalMs - 1
      );
      assert.deepEqual(granted, [
        0,
        ordersPermitIntervalMs,
        ordersPermitIntervalMs
      ]);

      await clock.advanceTo(
        ordersPermitIntervalMs + postOrderPermitIntervalMs
      );
      assert.deepEqual(granted, [
        0,
        ordersPermitIntervalMs,
        ordersPermitIntervalMs,
        ordersPermitIntervalMs + postOrderPermitIntervalMs
      ]);
      await fourth;
    });
  });

  test(
    'preserves a fractional source quota without a reduced share',
    async () => {
      const limiter = createInMemoryUnaryLimiter();
      const quota: TInvestUnaryQuota = {
        bucket: 'rule:FractionalLimitService',
        maxRequests: fractionalRequestsPerSecond,
        windowMs: secondWindowMs
      };
      const granted: number[] = [];

      await withControlledTimers(async (clock) => {
        await recordPermit(limiter, quota, clock, granted);

        const following = recordPermit(limiter, quota, clock, granted);

        await clock.advanceTo(fractionalPermitIntervalMs - 1);
        assert.deepEqual(granted, [0]);

        await clock.advanceTo(fractionalPermitIntervalMs);
        assert.deepEqual(granted, [0, fractionalPermitIntervalMs]);
        await following;
      });
    }
  );

  test('limits permits to the configured quota share', async () => {
    const limiter = createInMemoryUnaryLimiter({ quotaShare: halfQuotaShare });
    const marketQuota: TInvestUnaryQuota = {
      bucket: 'rule:MarketDataService',
      maxRequests: marketDataRequestsPerMinute,
      windowMs: minuteWindowMs
    };
    const reportQuota: TInvestUnaryQuota = {
      bucket: 'quota:OperationsService:reports',
      maxRequests: reportsRequestsPerMinute,
      windowMs: minuteWindowMs
    };
    const granted: number[] = [];

    await withControlledTimers(async (clock) => {
      await recordPermit(limiter, marketQuota, clock, granted);

      const marketCall = recordPermit(limiter, marketQuota, clock, granted);

      await clock.advanceTo(halfShareMarketPermitIntervalMs - 1);
      assert.deepEqual(granted, [0]);

      await clock.advanceTo(halfShareMarketPermitIntervalMs);
      assert.deepEqual(granted, [0, halfShareMarketPermitIntervalMs]);
      await marketCall;

      await recordPermit(limiter, reportQuota, clock, granted);

      const reportCall = recordPermit(limiter, reportQuota, clock, granted);

      await clock.advanceTo(
        halfShareMarketPermitIntervalMs + halfShareReportsPermitIntervalMs - 1
      );
      assert.deepEqual(granted, [
        0,
        halfShareMarketPermitIntervalMs,
        halfShareMarketPermitIntervalMs
      ]);

      await clock.advanceTo(
        halfShareMarketPermitIntervalMs + halfShareReportsPermitIntervalMs
      );
      assert.deepEqual(granted, [
        0,
        halfShareMarketPermitIntervalMs,
        halfShareMarketPermitIntervalMs,
        halfShareMarketPermitIntervalMs + halfShareReportsPermitIntervalMs
      ]);
      await reportCall;
    });
  });

  test('rejects an invalid quota share', () => {
    for (
      const quotaShare of [
        Number.NaN,
        Number.POSITIVE_INFINITY,
        -halfQuotaShare,
        0,
        minimumQuotaShare / 2,
        maximumQuotaShare + minimumQuotaShare / 2
      ]
    ) {
      assert.throws(
        () => createInMemoryUnaryLimiter({ quotaShare }),
        new RegExp(
          `quotaShare must be a finite number between ${minimumQuotaShare} and ${maximumQuotaShare}`
        )
      );
    }
  });

  test(
    'paces a scaled quota below one permit over a longer interval',
    async () => {
      const limiter = createInMemoryUnaryLimiter({
        quotaShare: minimumQuotaShare
      });
      const quota: TInvestUnaryQuota = {
        bucket: 'rule:VeryLowLimitService',
        maxRequests: oneRequestPerMinute,
        windowMs: minuteWindowMs
      };
      const granted: number[] = [];

      await withControlledTimers(async (clock) => {
        await recordPermit(limiter, quota, clock, granted);

        const following = recordPermit(limiter, quota, clock, granted);

        await clock.advanceTo(minimumSharePermitIntervalMs - 1);
        assert.deepEqual(granted, [0]);

        await clock.advanceTo(minimumSharePermitIntervalMs);
        assert.deepEqual(granted, [0, minimumSharePermitIntervalMs]);
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
          maxRequests: reportsRequestsPerMinute,
          windowMs: minuteWindowMs
        },
        clock,
        granted
      );

      const independent = recordPermit(
        limiter,
        {
          bucket: 'rule:MarketDataService',
          maxRequests: marketDataRequestsPerMinute,
          windowMs: minuteWindowMs
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
        maxRequests: conflictingOrdersRequestsPerMinute
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

      await clock.advanceTo(ordersPermitIntervalMs - 1);
      assert.deepEqual(granted, [0]);

      await clock.advanceTo(ordersPermitIntervalMs);
      assert.deepEqual(granted, [0, ordersPermitIntervalMs]);

      await clock.advanceTo(ordersPermitIntervalMs * 2 - 1);
      assert.deepEqual(granted, [0, ordersPermitIntervalMs]);

      await clock.advanceTo(ordersPermitIntervalMs * 2);
      assert.deepEqual(granted, [
        0,
        ordersPermitIntervalMs,
        ordersPermitIntervalMs * 2
      ]);
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

        clock.setCurrentTime(delayedPermitAtMs);
        await clock.advanceTo(delayedPermitAtMs);
        assert.deepEqual(granted, [0, delayedPermitAtMs]);
        await delayedCall;

        await clock.advanceTo(delayedPermitAtMs + ordersPermitIntervalMs - 1);
        assert.deepEqual(granted, [0, delayedPermitAtMs]);

        await clock.advanceTo(delayedPermitAtMs + ordersPermitIntervalMs);
        assert.deepEqual(granted, [
          0,
          delayedPermitAtMs,
          delayedPermitAtMs + ordersPermitIntervalMs
        ]);
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

      await clock.advanceTo(ordersPermitIntervalMs - 1);
      assert.deepEqual(granted, [0]);

      await clock.advanceTo(ordersPermitIntervalMs);
      assert.deepEqual(granted, [0, ordersPermitIntervalMs]);
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

      await clock.advanceTo(ordersPermitIntervalMs);
      assert.deepEqual(granted, [0, ordersPermitIntervalMs]);
      await waitingCall;

      await clock.advanceTo(ordersPermitIntervalMs * 2 - 1);
      assert.deepEqual(granted, [0, ordersPermitIntervalMs]);

      await clock.advanceTo(ordersPermitIntervalMs * 2);
      assert.deepEqual(granted, [
        0,
        ordersPermitIntervalMs,
        ordersPermitIntervalMs * 2
      ]);
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

        const waiting = Array.from({ length: queuedWaitCount }, (_, index) => {
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
        await clock.advanceTo(ordersPermitIntervalMs * 4);
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
          { length: cancelledWaitCount },
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
        clock.setCurrentTime(replacementRequestedAtMs);

        const replacement = recordPermit(limiter, ordersQuota, clock, granted);

        await clock.advanceTo(ordersPermitIntervalMs - 1);
        assert.deepEqual(granted, [0]);

        await clock.advanceTo(ordersPermitIntervalMs);
        assert.deepEqual(granted, [0, ordersPermitIntervalMs]);
        await replacement;

        const following = recordPermit(limiter, ordersQuota, clock, granted);

        await clock.advanceTo(ordersPermitIntervalMs * 2 - 1);
        assert.deepEqual(granted, [0, ordersPermitIntervalMs]);

        await clock.advanceTo(ordersPermitIntervalMs * 2);
        assert.deepEqual(granted, [
          0,
          ordersPermitIntervalMs,
          ordersPermitIntervalMs * 2
        ]);
        await following;
      });
    }
  );

  test(
    'keeps waits beyond the Node.js timer range pending for the full interval',
    async () => {
      const limiter = createInMemoryUnaryLimiter();
      const timerRangeOverflowIntervalMs =
        maxTimerDelayMs + timerRangeOverflowMs;
      const quota: TInvestUnaryQuota = {
        bucket: 'rule:VeryLowLimitService',
        maxRequests: oneRequestPerMinute,
        windowMs: timerRangeOverflowIntervalMs
      };
      const granted: number[] = [];

      await withControlledTimers(async (clock) => {
        await recordPermit(limiter, quota, clock, granted);

        const waitingCall = recordPermit(limiter, quota, clock, granted);

        assert.ok(clock.delays.length > 0);
        assert.ok(
          clock.delays.every((delay) => delay > 0 && delay <= maxTimerDelayMs)
        );

        await clock.advanceTo(timerRangeOverflowIntervalMs - 1);
        assert.deepEqual(granted, [0]);
        assert.ok(
          clock.delays.every((delay) => delay > 0 && delay <= maxTimerDelayMs)
        );

        await clock.advanceTo(timerRangeOverflowIntervalMs);
        assert.deepEqual(granted, [0, timerRangeOverflowIntervalMs]);
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
