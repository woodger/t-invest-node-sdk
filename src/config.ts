/**
 * Модуль package config задает default runtime policies пакета SDK.
 *
 * Здесь допустимы:
 * - значения CLI safety policy;
 * - значения throttling policy по generated service names;
 *
 * Здесь не должно быть runtime-преобразований, environment parsing или
 * transport initialization.
 */

import type { PackageConfigDefinition } from './config.types';

export const packageConfig = {
  unaryLimits: {
    /** Справочные данные инструментов. */
    InstrumentsService: {
      default: 200,
      groups: {
        'list-methods': {
          limit: 15,
          methods: [
            'Bonds',
            'Shares',
            'Options',
            'Futures',
            'Etfs',
            'GetAssets'
          ]
        }
      }
    },

    /** Рыночные данные: цены, свечи и стакан. */
    MarketDataService: {
      default: 600
    },

    /** Операции, портфель, позиции, отчеты и лимиты. */
    OperationsService: {
      default: 200,
      groups: {
        reports: {
          limit: 5,
          methods: [
            'GetBrokerReport',
            'GetDividendsForeignIssuer'
          ]
        }
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
  },

  /**
   * Требует явный `--confirm` для CLI-команд с side effects.
   * Это package policy, а не provider API contract.
   */
  requireSideEffectConfirmation: true
} as const satisfies PackageConfigDefinition;
