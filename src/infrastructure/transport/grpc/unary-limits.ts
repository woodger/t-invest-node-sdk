/**
 * Модуль gRPC limit mapping преобразует service/method declarations в runtime
 * ключи локального throttling.
 *
 * Здесь допустимы:
 * - контракт читаемой декларации unary limits;
 * - построение полных gRPC method paths.
 *
 * Здесь не должно быть package defaults или состояния throttling.
 */

import type {
  UnaryLimitBuckets,
  UnaryLimits
} from '../../../application/services/unary-throttle.service';

export type UnaryLimitsDefinition = Record<string, {
  default?: number;
  methods?: Record<string, number>;
}>;

export type UnaryLimitBucketsDefinition = Record<string, {
  methods: readonly string[];
  service: string;
}>;

const grpcServicePathPrefix = '/tinkoff.public.invest.api.contract.v1.';

/**
 * Возвращает новый плоский `UnaryLimits` с полными gRPC paths для method limits,
 * чтобы результат можно было объединять с `defaultConfig.unaryLimits`.
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
      limits[`${grpcServicePathPrefix}${service}/${method}`] = limit;
    }
  }

  return limits;
}

/**
 * Связывает method rules с общей quota group, не меняя плоский контракт
 * `UnaryLimits` и значения самих лимитов.
 */
export function defineUnaryLimitBuckets(
  definition: UnaryLimitBucketsDefinition
): UnaryLimitBuckets {
  const buckets: UnaryLimitBuckets = {};

  for (const [bucket, group] of Object.entries(definition)) {
    for (const method of group.methods) {
      const path = `${grpcServicePathPrefix}${group.service}/${method}`;
      const assignedBucket = buckets[path];

      if (assignedBucket !== undefined) {
        throw new Error(
          `Unary limit rule ${path} is assigned to both ${assignedBucket} and ${bucket}`
        );
      }

      buckets[path] = bucket;
    }
  }

  return buckets;
}
