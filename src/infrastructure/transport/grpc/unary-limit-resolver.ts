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
    const exactLimit = this.getOwnLimit(path);

    if (exactLimit !== undefined) {
      return this.createQuota(path, exactLimit);
    }

    const serviceName = this.resolveServiceName(path);

    if (serviceName === undefined) {
      return undefined;
    }

    const serviceLimit = this.getOwnLimit(serviceName);

    return serviceLimit === undefined
      ? undefined
      : this.createQuota(serviceName, serviceLimit);
  }

  private getOwnLimit(key: string): TInvestUnaryLimit | undefined {
    return Object.hasOwn(this.limits, key)
      ? this.limits[key]
      : undefined;
  }

  private createQuota(
    matchedKey: string,
    matchedLimit: TInvestUnaryLimit
  ): TInvestUnaryQuota {
    const quotaBucket = this.buckets[matchedKey];

    return {
      bucket: quotaBucket === undefined
        ? `rule:${matchedKey}`
        : `quota:${quotaBucket}`,
      maxRequests: matchedLimit.maxRequests,
      windowMs: matchedLimit.windowMs
    };
  }

  private resolveServiceName(path: string): string | undefined {
    const methodSeparator = path.lastIndexOf('/');

    if (methodSeparator < 1) {
      return undefined;
    }

    const qualifiedService = path.slice(0, methodSeparator);
    const serviceSeparator = Math.max(
      qualifiedService.lastIndexOf('.'),
      qualifiedService.lastIndexOf('/')
    );

    return qualifiedService.slice(serviceSeparator + 1);
  }
}
