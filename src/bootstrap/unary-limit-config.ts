/**
 * Компилирует декларативную unary limit policy для bootstrap SDK.
 */

import type {
  UnaryLimitBuckets
} from '../application/services/unary-throttle.service';
import type {
  UnaryLimits,
  UnaryLimitsConfig,
  UnaryLimitsDefinition
} from '../config.types';
import { unaryMethodPath } from '../infrastructure/transport/grpc/unary-limits';

export interface CompiledUnaryLimits {
  buckets: UnaryLimitBuckets;
  limits: UnaryLimits;
}

/**
 * Преобразует читаемое описание per-instance overrides в плоские rules.
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

export function compileUnaryLimits(
  definition: UnaryLimitsConfig
): CompiledUnaryLimits {
  const buckets: UnaryLimitBuckets = {};
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

  return {
    buckets,
    limits
  };
}

function assertUnaryLimit(limit: number, rule: string): void {
  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error(
      `Unary limit ${rule} must be a finite positive number`
    );
  }
}
