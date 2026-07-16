/**
 * Модуль config types описывает декларативную package policy и публичную
 * runtime конфигурацию SDK.
 *
 * Здесь допустимы:
 * - type contracts для public config surface;
 * - compile-time контракт человекочитаемых package defaults;
 * - переиспользование application service types;
 *
 * Здесь не должно быть default values или runtime validation.
 */

import type {
  InstrumentsService,
  MarketDataService,
  OperationsService,
  OrdersService,
  SandboxService,
  StopOrdersService,
  UsersService
} from './application/dto/tinkoff-invest-services';

type GrpcMethodName<Service> = Capitalize<Extract<keyof Service, string>>;

export type UnaryLimits = Record<string, number>;

export type UnaryLimitsDefinition = Record<string, {
  default?: number;
  methods?: Record<string, number>;
}>;

export interface UnaryQuotaGroupConfig<Method extends string = string> {
  limit: number;
  methods: readonly [Method, ...Method[]];
}

export interface UnaryServiceLimitsConfig<Method extends string = string> {
  default: number;
  methods?: Readonly<Partial<Record<Method, number>>>;
  groups?: Readonly<Record<string, UnaryQuotaGroupConfig<Method>>>;
}

export type UnaryLimitsConfig = Readonly<Record<
  string,
  UnaryServiceLimitsConfig
>>;

export type PackageUnaryLimitsConfig = {
  InstrumentsService: UnaryServiceLimitsConfig<GrpcMethodName<InstrumentsService>>;
  MarketDataService: UnaryServiceLimitsConfig<GrpcMethodName<MarketDataService>>;
  OperationsService: UnaryServiceLimitsConfig<GrpcMethodName<OperationsService>>;
  OrdersService: UnaryServiceLimitsConfig<GrpcMethodName<OrdersService>>;
  SandboxService: UnaryServiceLimitsConfig<GrpcMethodName<SandboxService>>;
  StopOrdersService: UnaryServiceLimitsConfig<GrpcMethodName<StopOrdersService>>;
  UsersService: UnaryServiceLimitsConfig<GrpcMethodName<UsersService>>;
};

export interface PackageConfigDefinition {
  unaryLimits: PackageUnaryLimitsConfig;
  requireSideEffectConfirmation: boolean;
}

export interface TinkoffInvestNodeSDKConfig {
  unaryLimits: UnaryLimits;
  requireSideEffectConfirmation: boolean;
}
