/**
 * Модуль bootstrap SDK facade собирает публичный `TInvestNodeSDK` runtime.
 *
 * Здесь допустимы:
 * - lazy creation generated service clients;
 * - владение shared gRPC channel и metadata;
 * - подключение application throttling policy к transport adapters;
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
import { Throttle } from '../application/services/unary-throttle.service';
import {
  createSdkChannel,
  createSdkClient,
  createSdkMetadata,
  UnaryLimitResolver
} from '../infrastructure/transport/grpc';
import {
  resolveSdkInstanceOptions,
  resolveUnaryThrottleConfig,
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
  private options: ResolvedTInvestOptions;
  private storage: Map<ServiceDefinition, ServiceClient> = new Map();
  private channel: Channel;
  private metadata: Metadata;
  private throttle: Throttle;
  private unaryLimitResolver: UnaryLimitResolver;
  private closed = false;
  private lifecycleController = new AbortController();
  
  constructor(options: TInvestOptions) {
    this.options = resolveSdkInstanceOptions(options);

    const unaryThrottleConfig = resolveUnaryThrottleConfig(
      this.options.unaryLimits
    );

    this.throttle = new Throttle();
    this.unaryLimitResolver = new UnaryLimitResolver(
      unaryThrottleConfig.limits,
      unaryThrottleConfig.buckets
    );
    this.channel = createSdkChannel(
      this.options,
      packageConfig.grpc.maxReceiveMessageLength
    );
    this.metadata = createSdkMetadata(this.options);
  }

  get instruments() {
    return this.useServiceAsClient<InstrumentsServiceClient>(InstrumentsServiceDefinition) as InstrumentsService;
  }
  
  get marketdata() {
    return this.useServiceAsClient<MarketDataServiceClient>(MarketDataServiceDefinition) as MarketDataService;
  }

  get marketdataStream() {
    return this.useServiceAsClient<MarketDataStreamServiceClient>(
      MarketDataStreamServiceDefinition
    ) as MarketDataStreamService;
  }

  get operations() {
    return this.useServiceAsClient<OperationsServiceClient>(OperationsServiceDefinition) as OperationsService;
  }

  get operationsStream() {
    return this.useServiceAsClient<OperationsStreamServiceClient>(
      OperationsStreamServiceDefinition
    ) as OperationsStreamService;
  }
  
  get orders() {
    return this.useServiceAsClient<OrdersServiceClient>(OrdersServiceDefinition) as OrdersService;
  }

  get ordersStream() {
    return this.useServiceAsClient<OrdersStreamServiceClient>(OrdersStreamServiceDefinition) as OrdersStreamService;
  }

  get sandbox() {
    return this.useServiceAsClient<SandboxServiceClient>(SandboxServiceDefinition) as SandboxService;
  }

  get signals() {
    return this.useServiceAsClient<SignalServiceClient>(SignalServiceDefinition) as SignalService;
  }

  get stoporders() {
    return this.useServiceAsClient<StopOrdersServiceClient>(StopOrdersServiceDefinition) as StopOrdersService;
  }
  
  get users() {
    return this.useServiceAsClient<UsersServiceClient>(UsersServiceDefinition) as UsersService;
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

  private useServiceAsClient<T extends ServiceClient>(service: ServiceDefinition) {
    this.assertOpen();

    let client = this.storage.get(service);

    if (!client) {
      client = createSdkClient<ServiceClient>(
        service,
        this.channel,
        this.metadata,
        this.options.trackLimits,
        this.unaryLimitResolver,
        this.throttle,
        {
          useSsl: this.options.useSsl,
          signal: this.lifecycleController.signal,
          assertOpen: () => {
            this.assertOpen();
          }
        }
      );

      this.storage.set(service, client);
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
