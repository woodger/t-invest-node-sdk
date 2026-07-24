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
  SignalService,
  StopOrdersService,
  UsersService
} from './application/dto/tinkoff-invest-services';

type GrpcMethodName<Service> = Capitalize<Extract<keyof Service, string>>;

/**
 * Flat runtime rules локального throttling. Ключ — generated service name или
 * полный gRPC method path, значение — разрешенное число запросов в минуту.
 */
export type UnaryLimits = Record<string, number>;

/**
 * Человекочитаемые per-instance overrides без shared quota groups.
 * Package defaults подмешиваются отдельно при создании SDK instance.
 */
export type UnaryLimitsDefinition = Record<string, {
  /** Service fallback в запросах в минуту. */
  default?: number;

  /** Индивидуальные method limits в запросах в минуту. */
  methods?: Record<string, number>;
}>;

/** Одна общая квота provider-а для непустого списка generated RPC names. */
export interface UnaryQuotaGroupConfig<Method extends string = string> {
  /** Общий предел запросов в минуту для всех methods группы. */
  limit: number;

  /** RPC, которые расходуют один quota bucket. */
  methods: readonly [Method, ...Method[]];
}

/** Декларативная unary limit policy одного generated service. */
export interface UnaryServiceLimitsConfig<Method extends string = string> {
  /** Service fallback в запросах в минуту. */
  default: number;

  /** Независимые method quotas, которые заменяют service fallback. */
  methods?: Readonly<Partial<Record<Method, number>>>;

  /** Именованные shared quota buckets. */
  groups?: Readonly<Record<string, UnaryQuotaGroupConfig<Method>>>;
}

/** Человекочитаемая unary policy, сгруппированная по generated services. */
export type UnaryLimitsConfig = Readonly<Record<
  string,
  UnaryServiceLimitsConfig
>>;

/**
 * Package unary policy для всех поддерживаемых unary services.
 * Допустимые RPC names выводятся из синхронизированных public service
 * contracts.
 */
export type PackageUnaryLimitsConfig = {
  InstrumentsService: UnaryServiceLimitsConfig<GrpcMethodName<InstrumentsService>>;
  MarketDataService: UnaryServiceLimitsConfig<GrpcMethodName<MarketDataService>>;
  OperationsService: UnaryServiceLimitsConfig<GrpcMethodName<OperationsService>>;
  OrdersService: UnaryServiceLimitsConfig<GrpcMethodName<OrdersService>>;
  SandboxService: UnaryServiceLimitsConfig<GrpcMethodName<SandboxService>>;
  SignalService: UnaryServiceLimitsConfig<GrpcMethodName<SignalService>>;
  StopOrdersService: UnaryServiceLimitsConfig<GrpcMethodName<StopOrdersService>>;
  UsersService: UnaryServiceLimitsConfig<GrpcMethodName<UsersService>>;
};

/** Source contract декларативного package config без runtime mapping. */
export interface PackageConfigDefinition {
  /** Package defaults публичных per-instance SDK options. */
  sdk: {
    /** Использовать TLS, если instance option не задан. */
    useSsl: boolean;

    /** Применять локальный unary throttling, если instance option не задан. */
    trackLimits: boolean;
  };

  /** Package-owned transport policy общего gRPC channel. */
  grpc: {
    /** Максимальный размер одного входящего gRPC-сообщения в байтах. */
    maxReceiveMessageLength: number;
  };

  /** Provider limits и package quota groups. */
  unaryLimits: PackageUnaryLimitsConfig;

  /** CLI safety policy для команд с необратимыми или торговыми side effects. */
  requireSideEffectConfirmation: boolean;
}

/** Публичный runtime config после компиляции package defaults. */
export interface TinkoffInvestNodeSDKConfig {
  /** Flat unary rules, доступные для runtime inspection и overrides. */
  unaryLimits: UnaryLimits;

  /** Требует явное подтверждение CLI-команд с side effects. */
  requireSideEffectConfirmation: boolean;
}
