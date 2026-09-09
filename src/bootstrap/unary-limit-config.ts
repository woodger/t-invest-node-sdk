/**
 * Модуль bootstrap config compiler преобразует декларативную unary policy в
 * runtime-квоты для Consumer-owned limiter-а.
 *
 * Здесь допустимы:
 * - построение полных gRPC paths для method rules;
 * - сборка quota buckets и проверка инвариантов декларации;
 * - проверка инвариантов итогового runtime snapshot;
 * - public mapping читаемых per-instance overrides в flat UnaryLimits.
 *
 * Здесь не должно быть package defaults, limiter state или provider tariff
 * refresh.
 */

import type { TInvestUnaryLimit } from '../application/services/unary-limiter';
import type {
  UnaryLimits,
  UnaryLimitsConfig,
  UnaryLimitsDefinition
} from '../config.types';
import { unaryMethodPath } from '../infrastructure/transport/grpc/unary-method-path';

/** Path-keyed runtime policy, которую принимает transport resolver. */
export interface UnaryLimitConfig {
  buckets: Record<string, string>;
  limits: UnaryLimits;
}

/**
 * Service defaults сохраняются как короткие keys, а method limits получают
 * полные gRPC paths. Package defaults не подмешиваются, quota groups не
 * создаются.
 */
export function defineUnaryLimits(
  definition: UnaryLimitsDefinition
): UnaryLimits {
  const limits: UnaryLimits = {};

  for (const [service, serviceLimits] of Object.entries(definition)) {
    if (serviceLimits.default !== undefined) {
      limits[service] = cloneUnaryLimit(serviceLimits.default);
    }

    for (const [method, limit] of Object.entries(serviceLimits.methods ?? {})) {
      if (limit !== undefined) {
        limits[unaryMethodPath(service, method)] = cloneUnaryLimit(limit);
      }
    }
  }

  return limits;
}

/**
 * Отклоняет повторное объявление RPC, а также неположительные и неконечные
 * значения квот до создания SDK instance.
 */
export function compileUnaryLimits(
  definition: UnaryLimitsConfig
): UnaryLimitConfig {
  const buckets: Record<string, string> = {};
  const limits: UnaryLimits = {};

  for (const [service, serviceLimits] of Object.entries(definition)) {
    const assignedMethods = new Set<string>();

    assertUnaryLimit(serviceLimits.default, service);
    limits[service] = cloneUnaryLimit(serviceLimits.default);

    for (const [method, limit] of Object.entries(serviceLimits.methods ?? {})) {
      if (limit === undefined) {
        continue;
      }

      assertUnaryLimit(limit, `${service}/${method}`);
      assignedMethods.add(method);
      limits[unaryMethodPath(service, method)] = cloneUnaryLimit(limit);
    }

    for (const [groupName, group] of Object.entries(serviceLimits.groups ?? {})) {
      const bucket = `${service}:${groupName}`;

      assertUnaryLimit(group.limit, bucket);

      for (const method of group.methods) {
        if (assignedMethods.has(method)) {
          throw new Error(
            `Unary limit method ${service}/${method} is declared more than once`
          );
        }

        assignedMethods.add(method);

        const path = unaryMethodPath(service, method);

        limits[path] = cloneUnaryLimit(group.limit);
        buckets[path] = bucket;
      }
    }
  }

  const compiled = {
    buckets,
    limits
  };

  assertUnaryLimitConfig(compiled);

  return compiled;
}

/**
 * Проверяет limits и quota groups после применения public defaults и
 * per-instance overrides, до создания transport resolver.
 */
export function assertUnaryLimitConfig(config: UnaryLimitConfig): void {
  const limitsByBucket = new Map<string, TInvestUnaryLimit>();

  for (const [rule, limit] of Object.entries(config.limits)) {
    assertUnaryLimit(limit, rule);
  }

  for (const [rule, bucket] of Object.entries(config.buckets)) {
    const limit = config.limits[rule];

    if (limit === undefined) {
      throw new Error(
        `Unary quota group ${bucket} references unknown rule ${rule}`
      );
    }

    const bucketLimit = limitsByBucket.get(bucket);

    if (bucketLimit !== undefined && !sameUnaryLimit(bucketLimit, limit)) {
      throw new Error(
        `Unary quota group ${bucket} contains inconsistent limits`
      );
    }

    limitsByBucket.set(bucket, limit);
  }
}

export function cloneUnaryLimits(limits: UnaryLimits): UnaryLimits {
  return Object.fromEntries(
    Object.entries(limits).map(([rule, limit]) => [
      rule,
      cloneUnaryLimit(limit)
    ])
  );
}

export function sameUnaryLimit(
  first: TInvestUnaryLimit | undefined,
  second: TInvestUnaryLimit | undefined
): boolean {
  return first !== undefined
    && second !== undefined
    && first.maxRequests === second.maxRequests
    && first.windowMs === second.windowMs;
}

function cloneUnaryLimit(limit: TInvestUnaryLimit): TInvestUnaryLimit {
  return {
    maxRequests: limit.maxRequests,
    windowMs: limit.windowMs
  };
}

function assertUnaryLimit(
  limit: TInvestUnaryLimit,
  rule: string
): void {
  if (
    typeof limit !== 'object'
    || limit === null
    || !Number.isFinite(limit.maxRequests)
    || limit.maxRequests <= 0
  ) {
    throw new Error(
      `Unary limit ${rule}.maxRequests must be a finite positive number`
    );
  }

  if (!Number.isFinite(limit.windowMs) || limit.windowMs <= 0) {
    throw new Error(
      `Unary limit ${rule}.windowMs must be a finite positive number`
    );
  }
}
