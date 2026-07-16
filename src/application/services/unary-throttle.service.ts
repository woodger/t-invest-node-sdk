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

type UnaryLimitRules = Record<string, number>;
export type UnaryLimitBuckets = Record<string, string>;

type ResolvedUnaryLimit = {
  bucket: string;
  limit: number;
};

/**
 * Throttle распределяет unary-запросы по времени на основе лимита запросов в минуту.
 * Например, при лимите 200 запросов в минуту минимальный интервал между ними составляет 300 мс.
 */

export class Throttle {
  // Каждый service fallback, отдельный method override или quota group
  // владеет своей очередью вызовов.
  private stamps: Map<string, number> = new Map();
  private unaryLimitBuckets: UnaryLimitBuckets;
  private unaryLimits: UnaryLimitRules;

  constructor(
    unaryLimits: UnaryLimitRules,
    unaryLimitBuckets: UnaryLimitBuckets = {}
  ) {
    this.unaryLimits = unaryLimits;
    this.unaryLimitBuckets = unaryLimitBuckets;

    this.validateUnaryLimitBuckets();
  }

  async reduce(path: string) {
    const resolvedLimit = this.resolveLimitRule(path);

    if (resolvedLimit === undefined) {
      throw new Error(`Unhandled unary limits for ${path}`);
    }

    const time = new Date().getTime();
    const stamp = this.stamps.get(resolvedLimit.bucket) ?? 0;
    const delay = stamp - time;
    const interval = Math.ceil(6e4 / resolvedLimit.limit);

    // Резервируем следующий слот до первого await, чтобы конкурентные вызовы
    // одного bucket последовательно сдвигали его окно отправки.
    this.stamps.set(resolvedLimit.bucket, Math.max(stamp, time) + interval);

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
      if (limit !== undefined && this.matchesRule(path, key) && key.length > matchLength) {
        resolvedLimit = {
          bucket: this.resolveBucket(key),
          limit
        };
        matchLength = key.length;
      }
    }

    return resolvedLimit;
  }

  private matchesRule(path: string, key: string): boolean {
    if (path === key) {
      return true;
    }

    if (key.indexOf('/') > -1) {
      return false;
    }

    const methodSeparator = path.lastIndexOf('/');

    if (methodSeparator < 1) {
      return false;
    }

    const qualifiedService = path.slice(0, methodSeparator);
    const serviceSeparator = Math.max(
      qualifiedService.lastIndexOf('.'),
      qualifiedService.lastIndexOf('/')
    );

    return qualifiedService.slice(serviceSeparator + 1) === key;
  }

  private resolveBucket(key: string): string {
    const quotaGroup = this.unaryLimitBuckets[key];

    return quotaGroup === undefined
      ? `rule:${key}`
      : `quota:${quotaGroup}`;
  }

  private validateUnaryLimitBuckets(): void {
    const bucketLimits = new Map<string, number>();

    for (const key in this.unaryLimitBuckets) {
      const bucket = this.unaryLimitBuckets[key];
      const limit = this.unaryLimits[key];

      if (bucket === undefined) {
        continue;
      }

      if (limit === undefined) {
        throw new Error(`Unary quota group ${bucket} references unknown rule ${key}`);
      }

      const bucketLimit = bucketLimits.get(bucket);

      if (bucketLimit !== undefined && bucketLimit !== limit) {
        throw new Error(`Unary quota group ${bucket} contains inconsistent limits`);
      }

      bucketLimits.set(bucket, limit);
    }
  }
}
