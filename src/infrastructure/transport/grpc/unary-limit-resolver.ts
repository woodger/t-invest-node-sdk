/**
 * Transport resolver сопоставляет gRPC method path с готовыми unary quotas.
 *
 * Здесь допустимы:
 * - точное сопоставление method paths;
 * - разрешение service fallback по qualified gRPC service name;
 * - выбор runtime bucket для найденного правила.
 *
 * Здесь не должно быть compilation package config, validation limits или
 * limiter state.
 */

import type {
  TInvestUnaryLimit,
  TInvestUnaryQuota
} from '../../../application/services/unary-limiter';

type UnaryLimitRules = Readonly<Record<string, TInvestUnaryLimit>>;
type UnaryLimitBuckets = Readonly<Record<string, string>>;

export class UnaryLimitResolver {
  constructor(
    private readonly limits: UnaryLimitRules,
    private readonly buckets: UnaryLimitBuckets = {}
  ) {}

  resolve(path: string): TInvestUnaryQuota | undefined {
    let matchedKey: string | undefined;
    let matchedLimit: TInvestUnaryLimit | undefined;

    for (const [key, limit] of Object.entries(this.limits)) {
      if (
        this.matchesRule(path, key)
        && (matchedKey === undefined || key.length > matchedKey.length)
      ) {
        matchedKey = key;
        matchedLimit = limit;
      }
    }

    if (matchedKey === undefined || matchedLimit === undefined) {
      return undefined;
    }

    const quotaBucket = this.buckets[matchedKey];

    return {
      bucket: quotaBucket === undefined
        ? `rule:${matchedKey}`
        : `quota:${quotaBucket}`,
      maxRequests: matchedLimit.maxRequests,
      windowMs: matchedLimit.windowMs
    };
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
}
