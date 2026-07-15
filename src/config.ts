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
import { defineUnaryLimits } from './infrastructure/transport/grpc/unary-limits';

export * from './config.types';

export const defaultConfig: TinkoffInvestNodeSDKConfig = {
  unaryLimits: defineUnaryLimits({
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
  }),

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
