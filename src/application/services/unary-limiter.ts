/**
 * Модуль application service задаёт публичный port unary limiter-а и
 * необязательную process-local реализацию.
 *
 * Здесь допустимы:
 * - transport-neutral квота и контекст ожидания;
 * - структурный контракт пользовательской реализации;
 * - отменяемая in-memory очередь с монотонным временем.
 *
 * Здесь не должно быть разбора gRPC path, разрешения package config или
 * владения lifecycle внешнего limiter-а.
 */

/** Ограничение числа запросов в заданном временном окне. */
export interface TInvestUnaryLimit {
  /** Максимальное число запросов в окне. */
  readonly maxRequests: number;

  /** Размер окна в миллисекундах. */
  readonly windowMs: number;
}

/** Плоская таблица правил по service name или полному gRPC method path. */
export type TInvestUnaryLimits = Record<string, TInvestUnaryLimit>;

/** Разрешённая SDK квота и её непрозрачный общий bucket. */
export interface TInvestUnaryQuota extends TInvestUnaryLimit {
  /** Идентификатор общей квоты; Consumer должен сравнивать, но не разбирать его. */
  readonly bucket: string;
}

/** Контекст одного ожидания перед unary transport call. */
export interface TInvestUnaryLimitContext {
  /** Полный gRPC path фактически вызываемого unary RPC. */
  readonly path: string;

  /** Разрешённая SDK квота для этого вызова. */
  readonly quota: TInvestUnaryQuota;

  /** Отмена конкретного вызова или lifecycle SDK instance. */
  readonly signal: AbortSignal;
}

/** Consumer-owned стратегия ожидания перед unary-вызовами. */
export interface TInvestUnaryLimiter {
  acquire(context: TInvestUnaryLimitContext): Promise<void>;
}

/** Настройки встроенного process-local unary limiter-а. */
export interface TInvestInMemoryUnaryLimiterOptions {
  /**
   * Доля исходной квоты T-Invest в диапазоне `[0.2, 1]`.
   * По умолчанию limiter использует всю квоту.
   */
  readonly quotaShare?: number;
}

interface UnaryLimitRequest {
  intervalMs: number;
  signal: AbortSignal;
  previous: UnaryLimitRequest | undefined;
  next: UnaryLimitRequest | undefined;
  resolve(): void;
  reject(reason: unknown): void;
  onAbort(): void;
}

interface UnaryLimitTimer {
  active: boolean;
  handle: ReturnType<typeof setTimeout> | undefined;
}

interface UnaryLimitSchedule {
  readonly maxRequests: number;
  readonly windowMs: number;
  nextAvailableAt: number;
  head: UnaryLimitRequest | undefined;
  tail: UnaryLimitRequest | undefined;
  timer: UnaryLimitTimer | undefined;
}

const maxTimerDelayMs = 2_147_483_647;

/**
 * Создаёт необязательный process-local limiter с равномерной выдачей permits.
 * Один объект можно передать нескольким SDK instances для общего состояния.
 * `quotaShare` статически резервирует часть исходной квоты для других владельцев.
 */
export function createInMemoryUnaryLimiter(
  options: TInvestInMemoryUnaryLimiterOptions = {}
): TInvestUnaryLimiter {
  const quotaShare = options.quotaShare === undefined
    ? 1
    : options.quotaShare;

  assertQuotaShare(quotaShare);

  return new InMemoryUnaryLimiter(quotaShare);
}

class InMemoryUnaryLimiter implements TInvestUnaryLimiter {
  private readonly schedules: Map<string, UnaryLimitSchedule> = new Map();

  constructor(private readonly quotaShare: number) {}

  async acquire(context: TInvestUnaryLimitContext): Promise<void> {
    if (context.signal.aborted) {
      throw abortReason(context.signal);
    }

    const effectiveMaxRequests = resolveEffectiveMaxRequests(
      context.quota.maxRequests,
      this.quotaShare
    );

    const intervalMs = Math.ceil(
      context.quota.windowMs / effectiveMaxRequests
    );
    const schedule = this.getSchedule(context.quota);

    await new Promise<void>((resolve, reject) => {
      const request: UnaryLimitRequest = {
        intervalMs,
        signal: context.signal,
        previous: schedule.tail,
        next: undefined,
        resolve,
        reject,
        onAbort: () => {
          this.cancel(schedule, request);
        }
      };

      context.signal.addEventListener('abort', request.onAbort, { once: true });

      if (schedule.tail === undefined) {
        schedule.head = request;
      }
      else {
        schedule.tail.next = request;
      }

      schedule.tail = request;
      this.start(schedule);
    });
  }

  private getSchedule(quota: TInvestUnaryQuota): UnaryLimitSchedule {
    let schedule = this.schedules.get(quota.bucket);

    if (schedule === undefined) {
      schedule = {
        maxRequests: quota.maxRequests,
        windowMs: quota.windowMs,
        nextAvailableAt: 0,
        head: undefined,
        tail: undefined,
        timer: undefined
      };

      this.schedules.set(quota.bucket, schedule);
    }
    else if (
      schedule.maxRequests !== quota.maxRequests
      || schedule.windowMs !== quota.windowMs
    ) {
      throw new Error(`Conflicting quota for bucket ${quota.bucket}`);
    }

    return schedule;
  }

  private start(schedule: UnaryLimitSchedule): void {
    if (schedule.timer !== undefined || schedule.head === undefined) {
      return;
    }

    const time = performance.now();
    const scheduledAt = Math.max(schedule.nextAvailableAt, time);
    const delay = scheduledAt - time;

    if (delay <= 0) {
      this.dispatch(schedule, scheduledAt);

      return;
    }

    const timer: UnaryLimitTimer = {
      active: true,
      handle: undefined
    };

    schedule.timer = timer;
    timer.handle = setTimeout(() => {
      if (!timer.active) {
        return;
      }

      timer.active = false;

      if (schedule.timer === timer) {
        schedule.timer = undefined;
      }

      this.start(schedule);
    }, Math.min(delay, maxTimerDelayMs));
  }

  private dispatch(
    schedule: UnaryLimitSchedule,
    scheduledAt: number
  ): void {
    const request = schedule.head;

    if (request === undefined) {
      return;
    }

    this.removeRequest(schedule, request);
    request.signal.removeEventListener('abort', request.onAbort);
    const dispatchedAt = Math.max(scheduledAt, performance.now());

    schedule.nextAvailableAt = dispatchedAt + request.intervalMs;
    request.resolve();
    this.start(schedule);
  }

  private cancel(
    schedule: UnaryLimitSchedule,
    request: UnaryLimitRequest
  ): void {
    if (
      schedule.head !== request
      && request.previous === undefined
      && request.next === undefined
    ) {
      return;
    }

    const isHead = schedule.head === request;

    this.removeRequest(schedule, request);
    request.signal.removeEventListener('abort', request.onAbort);

    if (isHead) {
      this.clearTimer(schedule);
    }

    request.reject(abortReason(request.signal));

    if (isHead) {
      this.start(schedule);
    }
  }

  private removeRequest(
    schedule: UnaryLimitSchedule,
    request: UnaryLimitRequest
  ): void {
    if (request.previous === undefined) {
      schedule.head = request.next;
    }
    else {
      request.previous.next = request.next;
    }

    if (request.next === undefined) {
      schedule.tail = request.previous;
    }
    else {
      request.next.previous = request.previous;
    }

    request.previous = undefined;
    request.next = undefined;
  }

  private clearTimer(schedule: UnaryLimitSchedule): void {
    const timer = schedule.timer;

    if (timer === undefined) {
      return;
    }

    timer.active = false;

    if (timer.handle !== undefined) {
      clearTimeout(timer.handle);
    }

    schedule.timer = undefined;
  }
}

function assertQuotaShare(quotaShare: number): void {
  if (!Number.isFinite(quotaShare) || quotaShare < 0.2 || quotaShare > 1) {
    throw new RangeError('quotaShare must be a finite number between 0.2 and 1');
  }
}

function resolveEffectiveMaxRequests(
  maxRequests: number,
  quotaShare: number
): number {
  if (quotaShare === 1) {
    return maxRequests;
  }

  const scaledMaxRequests = maxRequests * quotaShare;

  return scaledMaxRequests >= 1
    ? Math.floor(scaledMaxRequests)
    : scaledMaxRequests;
}

function abortReason(signal: AbortSignal): unknown {
  if (signal.reason !== undefined) {
    return signal.reason;
  }

  const error = new Error('The operation was aborted');

  error.name = 'AbortError';

  return error;
}
