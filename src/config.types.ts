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
} from './application/dto/t-invest-services';
import type {
  TInvestUnaryLimit,
  TInvestUnaryLimits
} from './application/services/unary-limiter';

type GrpcMethodName<Service> = Capitalize<Extract<keyof Service, string>>;

/**
 * Flat runtime rules unary-квот. Ключ — generated service name или полный
 * gRPC method path, значение — число запросов и размер окна.
 */
export type UnaryLimits = TInvestUnaryLimits;

/**
 * Человекочитаемые per-instance overrides без shared quota groups.
 * Package defaults подмешиваются отдельно при создании SDK instance.
 */
export type UnaryLimitsDefinition = {
  [Service in keyof PackageUnaryLimitsConfig]?: {
    /** Service fallback. */
    default?: TInvestUnaryLimit;

    /** Индивидуальные method quotas. */
    methods?: PackageUnaryLimitsConfig[Service]['methods'];
  }
};

/** Одна общая квота provider-а для непустого списка generated RPC names. */
export interface UnaryQuotaGroupConfig<Method extends string = string> {
  /** Общая квота для всех methods группы. */
  limit: TInvestUnaryLimit;

  /** RPC, которые расходуют один quota bucket. */
  methods: readonly [Method, ...Method[]];
}

/** Декларативная unary limit policy одного generated service. */
export interface UnaryServiceLimitsConfig<Method extends string = string> {
  /** Service fallback. */
  default: TInvestUnaryLimit;

  /** Независимые method quotas, которые заменяют service fallback. */
  methods?: Readonly<Partial<Record<Method, TInvestUnaryLimit>>>;

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
export interface TInvestNodeSDKConfig {
  /** Flat unary rules, доступные для runtime inspection и overrides. */
  unaryLimits: UnaryLimits;

  /** Требует явное подтверждение CLI-команд с side effects. */
  requireSideEffectConfirmation: boolean;
}
