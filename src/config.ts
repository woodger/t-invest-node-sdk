/**
 * Модуль package config задает default runtime policies пакета SDK.
 *
 * Здесь допустимы:
 * - значения CLI safety policy;
 * - значения throttling policy по generated service names;
 * - разрешение per-instance overrides поверх package defaults;
 * - экспорт config types как часть public config surface;
 *
 * Здесь не должно быть environment parsing или transport initialization.
 */

import type {
  TinkoffInvestNodeSDKConfig,
  UnaryLimits
} from './config.types';
import type { UnaryLimitBuckets } from './application/services/unary-throttle.service';
import {
  defineUnaryLimitBuckets,
  defineUnaryLimits
} from './infrastructure/transport/grpc/unary-limits';

export * from './config.types';

const defaultUnaryLimitBuckets = defineUnaryLimitBuckets({
  'instruments:list-methods': {
    service: 'InstrumentsService',
    methods: [
      'Bonds',
      'Shares',
      'Options',
      'Futures',
      'Etfs',
      'GetAssets'
    ]
  },
  'operations:reports': {
    service: 'OperationsService',
    methods: [
      'GetBrokerReport',
      'GetDividendsForeignIssuer'
    ]
  }
});

const packageUnaryLimits = defineUnaryLimits({
  /** Справочные данные инструментов. */
  InstrumentsService: {
    default: 200,
    methods: {
      Bonds: 15,
      Shares: 15,
      Options: 15,
      Futures: 15,
      Etfs: 15,
      GetAssets: 15
    }
  },

  /** Рыночные данные: цены, свечи и стакан. */
  MarketDataService: {
    default: 600
  },

  /** Операции, портфель, позиции, отчеты и лимиты. */
  OperationsService: {
    default: 200,
    methods: {
      GetBrokerReport: 5,
      GetDividendsForeignIssuer: 5
    }
  },

  /** Торговые поручения и их состояние. */
  OrdersService: {
    default: 100,
    methods: {
      GetOrders: 200,
      PostOrder: 900,
      PostOrderAsync: 600,
      CancelOrder: 300,
      ReplaceOrder: 300
    }
  },

  /** Тестовый торговый контур. */
  SandboxService: {
    default: 200
  },

  /** Стоп-ордера. */
  StopOrdersService: {
    default: 50,
    methods: {
      GetStopOrders: 60
    }
  },

  /** Счета, тарифы и пользовательская информация. */
  UsersService: {
    default: 100
  }
});

export const defaultConfig: TinkoffInvestNodeSDKConfig = {
  unaryLimits: {
    ...packageUnaryLimits
  },

  /**
   * Требует явный `--confirm` для CLI-команд с side effects.
   * Это package policy, а не provider API contract.
   */
  requireSideEffectConfirmation: true
};

export function resolveUnaryLimits(overrides?: UnaryLimits): UnaryLimits {
  return {
    ...defaultConfig.unaryLimits,
    ...overrides
  };
}

export function resolveUnaryLimitBuckets(overrides?: UnaryLimits): UnaryLimitBuckets {
  const buckets = {
    ...defaultUnaryLimitBuckets
  };
  const limits = resolveUnaryLimits(overrides);
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
      && packageUnaryLimits[key] !== limits[key]
    ) {
      delete buckets[key];
    }
  }

  return buckets;
}
