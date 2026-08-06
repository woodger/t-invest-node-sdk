/**
 * Модуль application service планирует вызовы по готовым throttle rules.
 *
 * Здесь допустимы:
 * - расчет задержки по лимиту запросов в минуту;
 * - хранение in-memory состояния throttling окна;
 * - отмена ожидающих вызовов;
 *
 * Здесь не должно быть transport path parsing, config resolution
 * или gRPC client wiring.
 */

export interface ThrottleRule {
  /** Непрозрачный идентификатор очереди с общим временным графиком. */
  bucket: string;

  /** Разрешенное число вызовов в минуту. */
  limitPerMinute: number;
}

interface ThrottleRequest {
  interval: number;
  signal: AbortSignal | undefined;
  resolve(): void;
  reject(reason: unknown): void;
  onAbort(): void;
}

interface ThrottleTimer {
  active: boolean;
  handle: ReturnType<typeof setTimeout> | undefined;
}

interface ThrottleSchedule {
  nextAvailableAt: number;
  requests: ThrottleRequest[];
  timer: ThrottleTimer | undefined;
}

/**
 * Throttle распределяет unary-запросы по времени на основе лимита запросов в минуту.
 * Например, при лимите 200 запросов в минуту минимальный интервал между ними составляет 300 мс.
 */

export class Throttle {
  private schedules: Map<string, ThrottleSchedule> = new Map();

  async reduce(rule: ThrottleRule, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) {
      throw abortReason(signal);
    }

    const interval = Math.ceil(6e4 / rule.limitPerMinute);
    const schedule = this.getSchedule(rule.bucket);

    await new Promise<void>((resolve, reject) => {
      const request: ThrottleRequest = {
        interval,
        signal,
        resolve,
        reject,
        onAbort: () => {
          this.cancel(schedule, request);
        }
      };

      signal?.addEventListener('abort', request.onAbort, { once: true });
      schedule.requests.push(request);
      this.start(schedule);
    });
  }

  private getSchedule(bucket: string): ThrottleSchedule {
    let schedule = this.schedules.get(bucket);

    if (schedule === undefined) {
      schedule = {
        nextAvailableAt: 0,
        requests: [],
        timer: undefined
      };

      this.schedules.set(bucket, schedule);
    }

    return schedule;
  }

  private start(schedule: ThrottleSchedule): void {
    if (schedule.timer !== undefined || schedule.requests.length === 0) {
      return;
    }

    const time = new Date().getTime();
    const scheduledAt = Math.max(schedule.nextAvailableAt, time);
    const delay = scheduledAt - time;

    if (delay <= 0) {
      this.dispatch(schedule, scheduledAt);

      return;
    }

    const timer: ThrottleTimer = {
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

      this.dispatch(schedule, scheduledAt);
    }, delay);
  }

  private dispatch(schedule: ThrottleSchedule, scheduledAt: number): void {
    const request = schedule.requests.shift();

    if (request === undefined) {
      return;
    }

    request.signal?.removeEventListener('abort', request.onAbort);
    const dispatchedAt = Math.max(
      scheduledAt,
      new Date().getTime()
    );

    schedule.nextAvailableAt = dispatchedAt + request.interval;
    request.resolve();
    this.start(schedule);
  }

  private cancel(schedule: ThrottleSchedule, request: ThrottleRequest): void {
    const requestIndex = schedule.requests.indexOf(request);

    if (requestIndex < 0) {
      return;
    }

    const isHead = requestIndex === 0;

    schedule.requests.splice(requestIndex, 1);
    request.signal?.removeEventListener('abort', request.onAbort);

    if (isHead) {
      this.clearTimer(schedule);
    }

    request.reject(abortReason(request.signal));

    if (isHead) {
      this.start(schedule);
    }
  }

  private clearTimer(schedule: ThrottleSchedule): void {
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

function abortReason(signal: AbortSignal | undefined): unknown {
  if (signal?.reason !== undefined) {
    return signal.reason;
  }

  const error = new Error('The operation was aborted');

  error.name = 'AbortError';

  return error;
}
