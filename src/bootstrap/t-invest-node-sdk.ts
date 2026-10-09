/**
 * Модуль bootstrap SDK facade собирает публичный `TInvestNodeSDK` runtime.
 *
 * Здесь допустимы:
 * - lazy creation generated service clients;
 * - владение shared gRPC channel и metadata;
 * - подключение Consumer-owned unary limiter-а к transport adapters;
 *
 * Здесь не должно быть CLI command logic или generated DTO mapping.
 */

import {
  type Client,
  Channel,
  Metadata
} from 'nice-grpc';
import { packageConfig } from '../config';
import { InstrumentsServiceDefinition } from '../generated/instruments';
import {
  MarketDataServiceDefinition,
  MarketDataStreamServiceDefinition
} from '../generated/marketdata';
import {
  OperationsServiceDefinition,
  OperationsStreamServiceDefinition
} from '../generated/operations';
import {
  OrdersServiceDefinition,
  OrdersStreamServiceDefinition
} from '../generated/orders';
import { SandboxServiceDefinition } from '../generated/sandbox';
import { SignalServiceDefinition } from '../generated/signals';
import { StopOrdersServiceDefinition } from '../generated/stoporders';
import { UsersServiceDefinition } from '../generated/users';
import type { TInvestOptions } from '../application/dto/t-invest-options';
import type {
  InstrumentsService,
  MarketDataService,
  MarketDataStreamService,
  OperationsService,
  OperationsStreamService,
  OrdersService,
  OrdersStreamService,
  SandboxService,
  SignalService,
  StopOrdersService,
  UsersService
} from '../application/dto/t-invest-services';
import {
  SdkError,
  SdkErrorCode
} from '../application/errors/sdk-error';
import {
  createSdkChannel,
  createSdkClient,
  createSdkMetadata,
  UnaryLimitResolver
} from '../infrastructure/transport/grpc';
import {
  resolveSdkInstanceOptions,
  resolveUnaryLimitConfig,
  type ResolvedTInvestOptions
} from './sdk-config';

type ServiceDefinition = typeof InstrumentsServiceDefinition
  | typeof MarketDataServiceDefinition
  | typeof MarketDataStreamServiceDefinition
  | typeof OperationsServiceDefinition
  | typeof OperationsStreamServiceDefinition
  | typeof OrdersServiceDefinition
  | typeof OrdersStreamServiceDefinition
  | typeof SandboxServiceDefinition
  | typeof SignalServiceDefinition
  | typeof StopOrdersServiceDefinition
  | typeof UsersServiceDefinition;

export class TInvestNodeSDK {
  private readonly options: ResolvedTInvestOptions;
  private readonly clientsByServiceDefinition: Map<ServiceDefinition, unknown> = new Map();
  private readonly channel: Channel;
  private readonly metadata: Metadata;
  private readonly unaryLimitResolver: UnaryLimitResolver;
  private readonly maxReceiveMessageLength: number;
  private closed = false;
  private readonly lifecycleController = new AbortController();
  
  constructor(options: TInvestOptions) {
    this.options = resolveSdkInstanceOptions(options);
    this.maxReceiveMessageLength = packageConfig.grpc.maxReceiveMessageLength;

    const unaryLimitConfig = resolveUnaryLimitConfig(
      this.options.unaryLimits
    );

    this.unaryLimitResolver = new UnaryLimitResolver(
      unaryLimitConfig.limits,
      unaryLimitConfig.buckets
    );
    this.channel = createSdkChannel(
      this.options,
      this.maxReceiveMessageLength
    );
    this.metadata = createSdkMetadata(this.options);
  }

  get instruments(): InstrumentsService {
    return this.getOrCreateServiceClient(InstrumentsServiceDefinition);
  }
  
  get marketData(): MarketDataService {
    return this.getOrCreateServiceClient(MarketDataServiceDefinition);
  }

  get marketdataStream(): MarketDataStreamService {
    return this.getOrCreateServiceClient(
      MarketDataStreamServiceDefinition
    );
  }

  get operations(): OperationsService {
    return this.getOrCreateServiceClient(OperationsServiceDefinition);
  }

  get operationsStream(): OperationsStreamService {
    return this.getOrCreateServiceClient(
      OperationsStreamServiceDefinition
    );
  }
  
  get orders(): OrdersService {
    return this.getOrCreateServiceClient(OrdersServiceDefinition);
  }

  get ordersStream(): OrdersStreamService {
    return this.getOrCreateServiceClient(OrdersStreamServiceDefinition);
  }

  get sandbox(): SandboxService {
    return this.getOrCreateServiceClient(SandboxServiceDefinition);
  }

  get signals(): SignalService {
    return this.getOrCreateServiceClient(SignalServiceDefinition);
  }

  get stopOrders(): StopOrdersService {
    return this.getOrCreateServiceClient(StopOrdersServiceDefinition);
  }
  
  get users(): UsersService {
    return this.getOrCreateServiceClient(UsersServiceDefinition);
  }

  /**
   * Идемпотентно закрывает shared channel и запрещает новые SDK-вызовы.
   * Уже переданные transport-у операции нужно завершать их собственным AbortSignal.
   */
  close(): void {
    if (this.closed) {
      return;
    }

    this.closed = true;
    this.lifecycleController.abort(this.createClosedError());
    this.channel.close();
  }

  /**
   * Лениво создаёт и кеширует клиент service definition с общим channel и middleware SDK.
   * Доступ после закрытия SDK отклоняется, включая возврат ранее созданного клиента.
   */
  private getOrCreateServiceClient<Service extends ServiceDefinition>(
    serviceDefinition: Service
  ): Client<Service> {
    this.assertOpen();

    const cachedClient = this.clientsByServiceDefinition.get(serviceDefinition);

    if (cachedClient !== undefined) {
      // Кэш заполняется только клиентами, созданными для этого definition.
      return cachedClient as Client<Service>;
    }

    const client = createSdkClient(
      serviceDefinition,
      this.channel,
      this.metadata,
      this.options.unaryLimiter,
      this.unaryLimitResolver,
      {
        useSsl: this.options.useSsl,
        maxReceiveMessageLength: this.maxReceiveMessageLength,
        signal: this.lifecycleController.signal,
        assertOpen: () => {
          this.assertOpen();
        }
      }
    );

    this.clientsByServiceDefinition.set(serviceDefinition, client);

    return client;
  }

  /** Останавливает доступ к сервисам и новые RPC с SDK_CLOSED после закрытия SDK. */
  private assertOpen(): void {
    if (this.closed) {
      throw this.createClosedError();
    }
  }

  /** Задаёт lifecycle-ошибку для отказа в новом вызове и причины отмены ожиданий limiter-а. */
  private createClosedError(): SdkError<SdkErrorCode.SdkClosed> {
    return new SdkError(
      SdkErrorCode.SdkClosed,
      'TInvestNodeSDK is closed',
      {
        source: 'lifecycle'
      }
    );
  }

  /** Отклоняет доступ через прежние имена сервисов с ошибкой и подсказкой для миграции. */
  private static throwDeprecatedServiceGetter(): never {
    throw new SdkError(
      SdkErrorCode.InvalidArgument,
      'Прежние sdk.marketdata и sdk.stoporders не используйте: они устарели. Используйте вместо них sdk.marketData и sdk.stopOrders.',
      {
        source: 'sdk'
      }
    );
  }

  // Прежние имена регистрируются при загрузке класса только в runtime,
  // чтобы сохранить диагностику без включения этих getters в публичные TypeScript-типы.
  static {
    Object.defineProperties(this.prototype, {
      marketdata: {
        configurable: true,
        get: this.throwDeprecatedServiceGetter
      },
      stoporders: {
        configurable: true,
        get: this.throwDeprecatedServiceGetter
      }
    });
  }
}
