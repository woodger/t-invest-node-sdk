/**
 * Модуль application service управляет локальным throttling unary-запросов.
 *
 * Здесь допустимы:
 * - разрешение лимита по gRPC path;
 * - расчет задержки между unary-вызовами;
 * - хранение in-memory состояния throttling окна;
 *
 * Здесь не должно быть gRPC client wiring или CLI policy.
 */

export type UnaryLimits = Record<string, number>;

type ResolvedUnaryLimit = {
  key: string;
  limit: number;
};

/**
 * Throttle распределяет unary-запросы по времени на основе лимита запросов в минуту.
 * Например, при лимите 200 запросов в минуту минимальный интервал между ними составляет 300 мс.
 */

export class Throttle {
  // Каждый service fallback или method override владеет своей очередью вызовов.
  private stamps: Map<string, number> = new Map();
  private unaryLimits: UnaryLimits;

  constructor(unaryLimits: UnaryLimits) {
    this.unaryLimits = unaryLimits;
  }

  async reduce(path: string) {
    const resolvedLimit = this.resolveLimitRule(path);

    if (resolvedLimit === undefined) {
      throw new Error(`Unhandled unary limits for ${path}`);
    }

    const time = new Date().getTime();
    const stamp = this.stamps.get(resolvedLimit.key) ?? 0;
    const delay = stamp - time;
    // Преобразуем лимит "запросов в минуту" в минимальный интервал между вызовами.
    const interval = Math.ceil(6e4 / resolvedLimit.limit);

    // Резервируем следующий слот до первого await, чтобы конкурентные вызовы
    // одного bucket последовательно сдвигали его окно отправки.
    this.stamps.set(resolvedLimit.key, Math.max(stamp, time) + interval);

    if (delay < 0) {
      return;
    }

    await new Promise((resolve) => 
      setTimeout(resolve, delay)
    );
  }

  resolveLimit(path: string) {
    return this.resolveLimitRule(path)?.limit;
  }

  private resolveLimitRule(path: string): ResolvedUnaryLimit | undefined {
    let resolvedLimit: ResolvedUnaryLimit | undefined;
    let matchLength = -1;

    for (const key in this.unaryLimits) {
      const limit = this.unaryLimits[key];

      // Для пересекающихся маршрутов выбираем самое специфичное совпадение.
      if (limit !== undefined && path.indexOf(key) > -1 && key.length > matchLength) {
        resolvedLimit = {
          key,
          limit
        };
        matchLength = key.length;
      }
    }

    return resolvedLimit;
  }
}
