/**
 * Модуль описывает типы исходных настроек модуля и публичных значений по
 * умолчанию.
 *
 * Здесь допустимы:
 * - типы публичных настроек;
 * - проверка формы исходных настроек при компиляции;
 * - переиспользование интерфейсов сервисов приложения.
 *
 * Здесь не должно быть значений по умолчанию или проверок при создании SDK.
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
 * Плоская таблица квот unary-вызовов. Ключ — имя сгенерированного сервиса или
 * полный путь gRPC-метода, значение — число запросов и размер окна.
 */
export type UnaryLimits = TInvestUnaryLimits;

/**
 * Переопределения квот для одного экземпляра без групп общих квот.
 * Значения по умолчанию модуля добавляются при создании SDK.
 */
export type UnaryLimitsDefinition = {
  [Service in keyof PackageUnaryLimitsConfig]?: {
    /** Service fallback. */
    default?: TInvestUnaryLimit;

    /** Индивидуальные method quotas. */
    methods?: PackageUnaryLimitsConfig[Service]['methods'];
  };
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
export type UnaryLimitsConfig = Readonly<
  Record<
    string,
    UnaryServiceLimitsConfig
  >
>;

/**
 * Настройки квот модуля для всех поддерживаемых unary-сервисов.
 * Допустимые имена RPC выводятся из синхронизированных интерфейсов сервисов.
 */
export type PackageUnaryLimitsConfig = {
  InstrumentsService: UnaryServiceLimitsConfig<
    GrpcMethodName<InstrumentsService>
  >;
  MarketDataService: UnaryServiceLimitsConfig<
    GrpcMethodName<MarketDataService>
  >;
  OperationsService: UnaryServiceLimitsConfig<
    GrpcMethodName<OperationsService>
  >;
  OrdersService: UnaryServiceLimitsConfig<GrpcMethodName<OrdersService>>;
  SandboxService: UnaryServiceLimitsConfig<GrpcMethodName<SandboxService>>;
  SignalService: UnaryServiceLimitsConfig<GrpcMethodName<SignalService>>;
  StopOrdersService: UnaryServiceLimitsConfig<
    GrpcMethodName<StopOrdersService>
  >;
  UsersService: UnaryServiceLimitsConfig<GrpcMethodName<UsersService>>;
};

/** Тип исходных настроек модуля без преобразований при создании SDK. */
export interface PackageConfigDefinition {
  /** Значения по умолчанию для параметров экземпляра SDK. */
  sdk: {
    /** Использовать TLS, если instance option не задан. */
    useSsl: boolean;
  };

  /** Настройки общего gRPC-канала. */
  grpc: {
    /** Максимальный размер одного входящего gRPC-сообщения в байтах. */
    maxReceiveMessageLength: number;
  };

  /** Квоты провайдера и группы общих квот. */
  unaryLimits: PackageUnaryLimitsConfig;

  /** CLI safety policy для команд с необратимыми или торговыми side effects. */
  requireSideEffectConfirmation: boolean;
}

/** Публичные значения по умолчанию, подготовленные из настроек модуля. */
export interface TInvestNodeSDKConfig {
  /** Плоская таблица квот, доступная для чтения и переопределения. */
  unaryLimits: UnaryLimits;

  /** Требует явное подтверждение CLI-команд с side effects. */
  requireSideEffectConfirmation: boolean;
}
