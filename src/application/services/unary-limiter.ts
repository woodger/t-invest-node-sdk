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

  return new InMemoryUnaryLimiter(quotaShare);
}

class InMemoryUnaryLimiter implements TInvestUnaryLimiter {
  private readonly schedules: Map<string, UnaryLimitSchedule> = new Map();

  constructor(private readonly quotaShare: number) {
    InMemoryUnaryLimiter.assertQuotaShare(quotaShare);
  }

  /**
   * Ожидает разрешения на unary-вызов в FIFO-очереди общего bucket-а.
   * Интервал выдачи учитывает quotaShare; отмена отклоняет ожидание с причиной AbortSignal.
   */
  async acquire(context: TInvestUnaryLimitContext): Promise<void> {
    if (context.signal.aborted) {
      throw InMemoryUnaryLimiter.abortReason(context.signal);
    }

    const effectiveMaxRequests = this.resolveEffectiveMaxRequests(
      context.quota.maxRequests
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

  /**
   * Возвращает или создаёт общее состояние очереди и выдачи permits для bucket-а.
   * Сохраняет время следующего допуска при пустой очереди и отклоняет разные квоты одного bucket-а.
   */
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

  /**
   * Планирует выдачу permit голове очереди с учётом времени следующего допуска.
   * Для одного bucket-а одновременно активен не более одного таймера.
   */
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

  /**
   * Выдаёт permit голове FIFO-очереди и планирует следующий допуск.
   * Интервал отсчитывается от фактической выдачи, чтобы задержка таймера
   * не позволила выдать несколько permits подряд.
   */
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

  /**
   * Отменяет ожидающий запрос, сохраняя интервал после последнего выданного permit.
   * Удаление головы очереди перепланирует ожидание; отмена сама по себе не расходует квоту.
   */
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

    request.reject(InMemoryUnaryLimiter.abortReason(request.signal));

    if (isHead) {
      this.start(schedule);
    }
  }

  /**
   * Исключает запрос из связанной очереди за O(1), сохраняя порядок остальных ожиданий.
   * Таймером, abort listener-ом и завершением Promise управляет вызывающий метод.
   */
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

  /**
   * Снимает таймер ожидания, сохраняя очередь и время следующего допуска.
   * Пометка inactive не даёт устаревшему callback-у продолжить выдачу permits.
   */
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

  /**
   * Проверяет долю квоты при создании limiter-а.
   * Отклоняет неконечные значения и значения вне `[0.2, 1]` с RangeError.
   */
  private static assertQuotaShare(quotaShare: number): void {
    if (!Number.isFinite(quotaShare) || quotaShare < 0.2 || quotaShare > 1) {
      throw new RangeError('quotaShare must be a finite number between 0.2 and 1');
    }
  }

  /**
   * Рассчитывает число permits в окне с учётом quotaShare этого limiter-а.
   * Полную квоту сохраняет; уменьшенную округляет вниз только при значении от единицы.
   * Значение меньше единицы задаёт интервал длиннее окна; округление до нуля сделало бы его бесконечным.
   */
  private resolveEffectiveMaxRequests(maxRequests: number): number {
    if (this.quotaShare === 1) {
      return maxRequests;
    }

    const scaledMaxRequests = maxRequests * this.quotaShare;

    return scaledMaxRequests >= 1
      ? Math.floor(scaledMaxRequests)
      : scaledMaxRequests;
  }

  /**
   * Сохраняет исходную причину отмены для отклонения ожидания permit.
   * Если AbortSignal не содержит причины, создаёт ошибку с именем AbortError.
   */
  private static abortReason(signal: AbortSignal): unknown {
    if (signal.reason !== undefined) {
      return signal.reason;
    }

    const error = new Error('The operation was aborted');

    error.name = 'AbortError';

    return error;
  }
}
