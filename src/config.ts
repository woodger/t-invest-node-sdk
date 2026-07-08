/**
 * Модуль package config задает default runtime policies пакета SDK.
 *
 * Здесь допустимы:
 * - значения CLI safety policy;
 * - значения throttling policy по generated service names;
 * - экспорт config types как часть public config surface;
 *
 * Здесь не должно быть environment parsing или transport initialization.
 */

import type { TinkoffInvestNodeSDKConfig } from './config.types';

export * from './config.types';

export const defaultConfig: TinkoffInvestNodeSDKConfig = {
  // Ключи соответствуют generated gRPC service names или method paths.
  unaryLimits: {
    /** Справочные данные инструментов. */
    InstrumentsService: 200,

    /** Рыночные данные: цены, свечи и стакан. */
    MarketDataService: 300,

    /** Операции, портфель, позиции, отчеты и лимиты. */
    OperationsService: 200,

    /** Торговые поручения и их состояние. */
    OrdersService: 100,

    /** Тестовый торговый контур. */
    SandboxService: 200,

    /** Стоп-ордера. */
    StopOrdersService: 50,

    /** Счета, тарифы и пользовательская информация. */
    UsersService: 100
  },

  /**
   * Требует явный `--confirm` для CLI-команд с side effects.
   * Это package policy, а не provider API contract.
   */
  requireSideEffectConfirmation: true
};
