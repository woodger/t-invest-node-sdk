/**
 * Модуль package config задает default runtime policies SDK.
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
  // Ключи сопоставляются с gRPC path и могут быть как сервисными, так и метод-специфичными.
  unaryLimits: {
    /**
     * Сервис инструментов
     * Справочная информация о ценных бумагах.
     */
    InstrumentsService: 200,

    /**
     * Сервис котировок предназначен для получения различной биржевой информации,
     * в том числе исторической
     */
    MarketDataService: 300,

    /**
     * Сервис операций
     * Предназначен для получения информации о портфеле по конкретному счету.
     */
    OperationsService: 200,

    /**
     * Сервис ордеров
     * Сервис для работы с торговыми поручениями.
     */
    OrdersService: 100,

    /**
     * Песочница — это тестовый контур.
     */
    SandboxService: 200,

    /**
     * Сервис стоп-ордеров
     */
    StopOrdersService: 50,

    /**
     * Сервис счетов
     * Предназначен для получения информации о пользователе и его счетах в Т-Инвестициях.
     */
    UsersService: 100
  },

  /**
   * Локальная policy для package CLI.
   *
   * Требует явный `--confirm` перед CLI-командами с side effects. Значение
   * управляет поведением bootstrap-команд SDK и не является частью Tinkoff
   * Invest API contract.
   */
  requireSideEffectConfirmation: true
};
