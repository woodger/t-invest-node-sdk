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
  Channel,
  Metadata
} from 'nice-grpc';
import { packageConfig } from '../config';
import { InstrumentsServiceDefinition,
  InstrumentsServiceClient
} from '../generated/instruments';
import {
  MarketDataServiceDefinition,
  MarketDataServiceClient,
  MarketDataStreamServiceDefinition,
  MarketDataStreamServiceClient
} from '../generated/marketdata';
import {
  OperationsServiceDefinition,
  OperationsServiceClient,
  OperationsStreamServiceDefinition,
  OperationsStreamServiceClient
} from '../generated/operations';
import {
  OrdersServiceDefinition,
  OrdersServiceClient,
  OrdersStreamServiceDefinition,
  OrdersStreamServiceClient
} from '../generated/orders';
import { SandboxServiceDefinition, SandboxServiceClient } from '../generated/sandbox';
import { SignalServiceDefinition, SignalServiceClient } from '../generated/signals';
import { StopOrdersServiceDefinition, StopOrdersServiceClient } from '../generated/stoporders';
import { UsersServiceDefinition, UsersServiceClient } from '../generated/users';
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

type ServiceClient = InstrumentsServiceClient
  | MarketDataServiceClient
  | MarketDataStreamServiceClient
  | OperationsServiceClient
  | OperationsStreamServiceClient
  | OrdersServiceClient
  | OrdersStreamServiceClient
  | SandboxServiceClient
  | SignalServiceClient
  | StopOrdersServiceClient
  | UsersServiceClient;

export class TInvestNodeSDK {
  private readonly options: ResolvedTInvestOptions;
  private readonly clientsByServiceDefinition: Map<ServiceDefinition, ServiceClient> = new Map();
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

  get instruments() {
    return this.getOrCreateServiceClient<InstrumentsServiceClient>(InstrumentsServiceDefinition) as InstrumentsService;
  }
  
  get marketData() {
    return this.getOrCreateServiceClient<MarketDataServiceClient>(MarketDataServiceDefinition) as MarketDataService;
  }

  get marketdataStream() {
    return this.getOrCreateServiceClient<MarketDataStreamServiceClient>(
      MarketDataStreamServiceDefinition
    ) as MarketDataStreamService;
  }

  get operations() {
    return this.getOrCreateServiceClient<OperationsServiceClient>(OperationsServiceDefinition) as OperationsService;
  }

  get operationsStream() {
    return this.getOrCreateServiceClient<OperationsStreamServiceClient>(
      OperationsStreamServiceDefinition
    ) as OperationsStreamService;
  }
  
  get orders() {
    return this.getOrCreateServiceClient<OrdersServiceClient>(OrdersServiceDefinition) as OrdersService;
  }

  get ordersStream() {
    return this.getOrCreateServiceClient<OrdersStreamServiceClient>(OrdersStreamServiceDefinition) as OrdersStreamService;
  }

  get sandbox() {
    return this.getOrCreateServiceClient<SandboxServiceClient>(SandboxServiceDefinition) as SandboxService;
  }

  get signals() {
    return this.getOrCreateServiceClient<SignalServiceClient>(SignalServiceDefinition) as SignalService;
  }

  get stopOrders() {
    return this.getOrCreateServiceClient<StopOrdersServiceClient>(StopOrdersServiceDefinition) as StopOrdersService;
  }
  
  get users() {
    return this.getOrCreateServiceClient<UsersServiceClient>(UsersServiceDefinition) as UsersService;
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

  private getOrCreateServiceClient<T extends ServiceClient>(
    serviceDefinition: ServiceDefinition
  ) {
    this.assertOpen();

    let client = this.clientsByServiceDefinition.get(serviceDefinition);

    if (!client) {
      client = createSdkClient<ServiceClient>(
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
    }

    return client as T;
  }

  private assertOpen(): void {
    if (this.closed) {
      throw this.createClosedError();
    }
  }

  private createClosedError(): SdkError<SdkErrorCode.SdkClosed> {
    return new SdkError(
      SdkErrorCode.SdkClosed,
      'TInvestNodeSDK is closed',
      {
        source: 'lifecycle'
      }
    );
  }
}

function throwDeprecatedServiceGetter(): never {
  throw new SdkError(
    SdkErrorCode.InvalidArgument,
    'Прежние sdk.marketdata и sdk.stoporders не используйте: они устарели. Используйте вместо них sdk.marketData и sdk.stopOrders.',
    {
      source: 'sdk'
    }
  );
}

Object.defineProperties(TInvestNodeSDK.prototype, {
  marketdata: {
    configurable: true,
    get: throwDeprecatedServiceGetter
  },
  stoporders: {
    configurable: true,
    get: throwDeprecatedServiceGetter
  }
});
