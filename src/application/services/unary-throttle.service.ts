/**
 * Модуль application service планирует вызовы по готовым throttle rules.
 *
 * Здесь допустимы:
 * - расчет задержки по лимиту запросов в минуту;
 * - хранение in-memory состояния throttling окна;
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

/**
 * Throttle распределяет unary-запросы по времени на основе лимита запросов в минуту.
 * Например, при лимите 200 запросов в минуту минимальный интервал между ними составляет 300 мс.
 */

export class Throttle {
  // Каждый resolved bucket владеет своей очередью вызовов.
  private stamps: Map<string, number> = new Map();

  async reduce(rule: ThrottleRule) {
    const time = new Date().getTime();
    const stamp = this.stamps.get(rule.bucket) ?? 0;
    const delay = stamp - time;
    const interval = Math.ceil(6e4 / rule.limitPerMinute);

    // Резервируем следующий слот до первого await, чтобы конкурентные вызовы
    // одного bucket последовательно сдвигали его окно отправки.
    this.stamps.set(rule.bucket, Math.max(stamp, time) + interval);

    if (delay < 0) {
      return;
    }

    await new Promise((resolve) => 
      setTimeout(resolve, delay)
    );
  }
}
