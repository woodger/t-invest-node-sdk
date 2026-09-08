/**
 * Модуль bootstrap config adapter собирает runtime policy для SDK instances.
 *
 * Здесь допустимы:
 * - компиляция package defaults в public flat config;
 * - разрешение per-instance unary limit overrides;
 * - согласование overrides с package quota groups;
 * - проверка инвариантов итогового instance snapshot;
 *
 * Здесь не должно быть transport initialization, provider tariff refresh или
 * limiter state.
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
import { InstrumentsServiceDefinition } from '../generated/instruments';
import { MarketDataServiceDefinition } from '../generated/marketdata';
import { OperationsServiceDefinition } from '../generated/operations';
import { OrdersServiceDefinition } from '../generated/orders';
import { SandboxServiceDefinition } from '../generated/sandbox';
import { SignalServiceDefinition } from '../generated/signals';
import { StopOrdersServiceDefinition } from '../generated/stoporders';
import { UsersServiceDefinition } from '../generated/users';
import type { UnaryLimitConfig } from './unary-limit-config';
import {
  assertUnaryLimitConfig,
  cloneUnaryLimits,
  compileUnaryLimits,
  sameUnaryLimit
} from './unary-limit-config';

export type ResolvedTInvestOptions = Omit<
  TInvestOptions,
  'useSsl'
> & {
  useSsl: boolean;
};

const packageUnaryLimits = compileUnaryLimits(packageConfig.unaryLimits);

interface UnaryServiceDefinitionContract {
  readonly name: string;
  readonly fullName: string;
  readonly methods: Readonly<Record<string, {
    readonly name: string;
    readonly requestStream: boolean;
    readonly responseStream: boolean;
  }>>;
}

const unaryServiceDefinitions: readonly UnaryServiceDefinitionContract[] = [
  InstrumentsServiceDefinition,
  MarketDataServiceDefinition,
  OperationsServiceDefinition,
  OrdersServiceDefinition,
  SandboxServiceDefinition,
  SignalServiceDefinition,
  StopOrdersServiceDefinition,
  UsersServiceDefinition
];
const knownUnaryLimitRules = new Set<string>(
  unaryServiceDefinitions.flatMap((definition) => [
    definition.name,
    ...Object.values(definition.methods)
      .filter((method) => !method.requestStream && !method.responseStream)
      .map((method) => `/${definition.fullName}/${method.name}`)
  ])
);

export const defaultConfig: TInvestNodeSDKConfig = {
  unaryLimits: cloneUnaryLimits(packageUnaryLimits.limits),
  requireSideEffectConfirmation: packageConfig.requireSideEffectConfirmation
};

export function resolveSdkInstanceOptions(
  options: TInvestOptions
): ResolvedTInvestOptions {
  assertRemovedTrackLimitsOption(options);
  assertNonBlankSdkOption(options.token, 'token');
  assertNonBlankSdkOption(options.endpoint, 'endpoint');
  assertGrpcMetadataValue(options.token, 'token');

  if (options.appName !== undefined && options.appName !== '') {
    assertGrpcMetadataValue(options.appName, 'appName');
  }

  assertUnaryLimiter(options.unaryLimiter);

  return {
    ...options,
    useSsl: options.useSsl ?? packageConfig.sdk.useSsl
  };
}

export function resolveUnaryLimitConfig(
  overrides?: UnaryLimits
): UnaryLimitConfig {
  try {
    const buckets = {
      ...packageUnaryLimits.buckets
    };
    const limits = cloneUnaryLimits({
      ...defaultConfig.unaryLimits,
      ...overrides
    });
    const limitsByBucket = new Map<
      string,
      (UnaryLimits[string] | undefined)[]
    >();

    for (const [key, bucket] of Object.entries(buckets)) {
      const limit = limits[key];
      const bucketLimits = limitsByBucket.get(bucket) ?? [];

      bucketLimits.push(limit);
      limitsByBucket.set(bucket, bucketLimits);
    }

    // Измененный method limit отсоединяется, только если иначе группа получила
    // бы разные значения. Согласованный override всей группы сохраняет bucket.
    for (const [key, bucket] of Object.entries(buckets)) {
      const bucketLimits = limitsByBucket.get(bucket);
      const firstLimit = bucketLimits?.[0];
      const hasOneDefinedLimit = firstLimit !== undefined
        && bucketLimits?.every(
          (limit) => sameUnaryLimit(firstLimit, limit)
        ) === true;

      if (
        !hasOneDefinedLimit
        && !sameUnaryLimit(packageUnaryLimits.limits[key], limits[key])
      ) {
        delete buckets[key];
      }
    }

    const resolvedConfig = {
      buckets,
      limits
    };

    assertKnownUnaryLimitRules(resolvedConfig.limits);
    assertUnaryLimitConfig(resolvedConfig);

    return resolvedConfig;
  }
  catch (error) {
    throw new SdkError(
      SdkErrorCode.InvalidArgument,
      errorMessage(error, 'TInvestOptions.unaryLimits is invalid'),
      {
        source: 'sdk',
        cause: error
      }
    );
  }
}

function assertRemovedTrackLimitsOption(options: TInvestOptions): void {
  if (Object.hasOwn(options, 'trackLimits')) {
    throw new SdkError(
      SdkErrorCode.InvalidArgument,
      'TInvestOptions.trackLimits is not supported; configure unaryLimiter explicitly',
      {
        source: 'sdk'
      }
    );
  }
}

function assertUnaryLimiter(limiter: TInvestOptions['unaryLimiter']): void {
  if (
    limiter !== undefined
    && (
      (typeof limiter !== 'object' && typeof limiter !== 'function')
      || limiter === null
      || typeof limiter.acquire !== 'function'
    )
  ) {
    throw new SdkError(
      SdkErrorCode.InvalidArgument,
      'TInvestOptions.unaryLimiter must provide an acquire function',
      {
        source: 'sdk'
      }
    );
  }
}

function assertKnownUnaryLimitRules(limits: UnaryLimits): void {
  for (const rule of Object.keys(limits)) {
    if (!knownUnaryLimitRules.has(rule)) {
      throw new Error(`Unknown unary limit rule ${rule}`);
    }
  }
}

const grpcMetadataValuePattern = /^[ -~]*$/;

function assertGrpcMetadataValue(
  value: unknown,
  name: 'token' | 'appName'
): asserts value is string {
  if (typeof value !== 'string' || !grpcMetadataValuePattern.test(value)) {
    throw new SdkError(
      SdkErrorCode.InvalidArgument,
      `TInvestOptions.${name} contains characters unsupported by gRPC metadata`,
      {
        source: 'sdk'
      }
    );
  }
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

function errorMessage(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null) {
    return fallback;
  }

  const message = (error as Record<PropertyKey, unknown>)['message'];

  return typeof message === 'string' ? message : fallback;
}
