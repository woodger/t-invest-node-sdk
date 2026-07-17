/**
 * Модуль bootstrap config compiler преобразует декларативную unary policy в
 * runtime rules локального throttling.
 *
 * Здесь допустимы:
 * - построение полных gRPC paths для method rules;
 * - сборка quota buckets и проверка инвариантов декларации;
 * - проверка инвариантов итогового runtime snapshot;
 * - public mapping читаемых per-instance overrides в flat UnaryLimits;
 *
 * Здесь не должно быть package defaults, runtime throttling state или
 * provider tariff refresh.
 */

import type {
  UnaryLimits,
  UnaryLimitsConfig,
  UnaryLimitsDefinition
} from '../config.types';
import { unaryMethodPath } from '../infrastructure/transport/grpc/unary-limits';

/** Path-keyed runtime policy, которую принимает transport resolver. */
export interface UnaryThrottleConfig {
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
      limits[service] = serviceLimits.default;
    }

    for (const [method, limit] of Object.entries(serviceLimits.methods ?? {})) {
      limits[unaryMethodPath(service, method)] = limit;
    }
  }

  return limits;
}

/**
 * Отклоняет повторное объявление RPC, а также неположительные и неконечные
 * limits до создания SDK instance.
 */
export function compileUnaryLimits(
  definition: UnaryLimitsConfig
): UnaryThrottleConfig {
  const buckets: Record<string, string> = {};
  const limits: UnaryLimits = {};

  for (const [service, serviceLimits] of Object.entries(definition)) {
    const assignedMethods = new Set<string>();

    assertUnaryLimit(serviceLimits.default, service);
    limits[service] = serviceLimits.default;

    for (const [method, limit] of Object.entries(serviceLimits.methods ?? {})) {
      if (limit === undefined) {
        continue;
      }

      assertUnaryLimit(limit, `${service}/${method}`);
      assignedMethods.add(method);
      limits[unaryMethodPath(service, method)] = limit;
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

        limits[path] = group.limit;
        buckets[path] = bucket;
      }
    }
  }

  const compiled = {
    buckets,
    limits
  };

  assertUnaryThrottleConfig(compiled);

  return compiled;
}

/**
 * Проверяет limits и quota groups после применения public defaults и
 * per-instance overrides, до создания transport resolver и scheduler.
 */
export function assertUnaryThrottleConfig(
  config: UnaryThrottleConfig
): void {
  const bucketLimits = new Map<string, number>();

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

    const bucketLimit = bucketLimits.get(bucket);

    if (bucketLimit !== undefined && bucketLimit !== limit) {
      throw new Error(
        `Unary quota group ${bucket} contains inconsistent limits`
      );
    }

    bucketLimits.set(bucket, limit);
  }
}

function assertUnaryLimit(limit: number, rule: string): void {
  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error(
      `Unary limit ${rule} must be a finite positive number`
    );
  }
}
