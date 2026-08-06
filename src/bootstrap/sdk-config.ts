/**
 * Модуль bootstrap config adapter собирает runtime policy для SDK instances.
 *
 * Здесь допустимы:
 * - компиляция package defaults в совместимый public flat config;
 * - разрешение boolean defaults публичных SDK options;
 * - разрешение per-instance unary limit overrides;
 * - согласование overrides с package quota groups;
 * - проверка инвариантов итогового instance snapshot;
 *
 * Здесь не должно быть transport initialization, provider tariff refresh или
 * throttling state.
 */

import type { TInvestOptions } from '../application/dto/t-invest-options';
import {
  SdkError,
  SdkErrorCode
} from '../application/errors/sdk-error';
import type {
  TInvestNodeSDKConfig,
  UnaryLimits
} from '../config.types';
import { packageConfig } from '../config';
import type { UnaryThrottleConfig } from './unary-limit-config';
import {
  assertUnaryThrottleConfig,
  compileUnaryLimits
} from './unary-limit-config';

export type ResolvedTInvestOptions = Omit<
  TInvestOptions,
  'useSsl' | 'trackLimits'
> & {
  useSsl: boolean;
  trackLimits: boolean;
};

const packageUnaryLimits = compileUnaryLimits(packageConfig.unaryLimits);

export const defaultConfig: TInvestNodeSDKConfig = {
  unaryLimits: {
    ...packageUnaryLimits.limits
  },
  requireSideEffectConfirmation: packageConfig.requireSideEffectConfirmation
};

export function resolveSdkInstanceOptions(
  options: TInvestOptions
): ResolvedTInvestOptions {
  assertNonBlankSdkOption(options.token, 'token');
  assertNonBlankSdkOption(options.endpoint, 'endpoint');

  return {
    ...options,
    useSsl: options.useSsl ?? packageConfig.sdk.useSsl,
    trackLimits: options.trackLimits ?? packageConfig.sdk.trackLimits
  };
}

export function resolveUnaryThrottleConfig(
  overrides?: UnaryLimits
): UnaryThrottleConfig {
  const buckets = {
    ...packageUnaryLimits.buckets
  };
  const limits = {
    ...defaultConfig.unaryLimits,
    ...overrides
  };
  const limitsByBucket = new Map<string, Set<number | undefined>>();

  for (const [key, bucket] of Object.entries(buckets)) {
    const limit = limits[key];
    const bucketLimits = limitsByBucket.get(bucket) ?? new Set<number | undefined>();

    bucketLimits.add(limit);
    limitsByBucket.set(bucket, bucketLimits);
  }

  // Измененный method limit отсоединяется, только если иначе группа получила
  // бы разные значения. Согласованный override всей группы сохраняет bucket.
  for (const [key, bucket] of Object.entries(buckets)) {
    const bucketLimits = limitsByBucket.get(bucket);
    const hasOneDefinedLimit = bucketLimits?.size === 1
      && !bucketLimits.has(undefined);

    if (
      !hasOneDefinedLimit
      && packageUnaryLimits.limits[key] !== limits[key]
    ) {
      delete buckets[key];
    }
  }

  const resolvedConfig = {
    buckets,
    limits
  };

  assertUnaryThrottleConfig(resolvedConfig);

  return resolvedConfig;
}

function assertNonBlankSdkOption(
  value: unknown,
  name: 'token' | 'endpoint'
): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new SdkError(
      SdkErrorCode.InvalidArgument,
      `TInvestOptions.${name} must be a non-empty string`,
      {
        source: 'sdk'
      }
    );
  }
}
