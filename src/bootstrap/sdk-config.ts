/**
 * Модуль bootstrap config adapter собирает runtime policy для SDK instances.
 *
 * Здесь допустимы:
 * - компиляция package defaults в совместимый public flat config;
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
import { InstrumentsServiceDefinition } from '../generated/instruments';
import { MarketDataServiceDefinition } from '../generated/marketdata';
import { OperationsServiceDefinition } from '../generated/operations';
import { OrdersServiceDefinition } from '../generated/orders';
import { SandboxServiceDefinition } from '../generated/sandbox';
import { SignalServiceDefinition } from '../generated/signals';
import { StopOrdersServiceDefinition } from '../generated/stoporders';
import { UsersServiceDefinition } from '../generated/users';
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
  assertGrpcMetadataValue(options.token, 'token');

  if (options.appName !== undefined && options.appName !== '') {
    assertGrpcMetadataValue(options.appName, 'appName');
  }

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

  try {
    assertKnownUnaryLimitRules(resolvedConfig.limits);
    assertUnaryThrottleConfig(resolvedConfig);
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

  return resolvedConfig;
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
