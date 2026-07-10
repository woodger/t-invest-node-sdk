/**
 * Модуль bootstrap SDK facade собирает публичный `TinkoffInvestNodeSDK` runtime.
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
import { InstrumentsServiceDefinition,
  InstrumentsServiceClient
} from '../generated/t_tech/invest/grpc/instruments';
import {
  MarketDataServiceDefinition,
  MarketDataServiceClient,
  MarketDataStreamServiceDefinition,
  MarketDataStreamServiceClient
} from '../generated/t_tech/invest/grpc/marketdata';
import {
  OperationsServiceDefinition,
  OperationsServiceClient,
  OperationsStreamServiceDefinition,
  OperationsStreamServiceClient
} from '../generated/t_tech/invest/grpc/operations';
import {
  OrdersServiceDefinition,
  OrdersServiceClient,
  OrdersStreamServiceDefinition,
  OrdersStreamServiceClient
} from '../generated/t_tech/invest/grpc/orders';
import { SandboxServiceDefinition, SandboxServiceClient } from '../generated/t_tech/invest/grpc/sandbox';
import { StopOrdersServiceDefinition, StopOrdersServiceClient } from '../generated/t_tech/invest/grpc/stoporders';
import { UsersServiceDefinition, UsersServiceClient } from '../generated/t_tech/invest/grpc/users';
import type { TinkoffInvestOptions } from '../application/dto/tinkoff-invest-options';
import type {
  InstrumentsService,
  MarketDataService,
  MarketDataStreamService,
  OperationsService,
  OperationsStreamService,
  OrdersService,
  OrdersStreamService,
  SandboxService,
  StopOrdersService,
  UsersService
} from '../application/dto/tinkoff-invest-services';
import { Throttle } from '../application/services/unary-throttle.service';
import { defaultConfig } from '../config';
import { createSdkChannel, createSdkClient, createSdkMetadata } from '../infrastructure/transport/grpc';

type ServiceDefinition = typeof InstrumentsServiceDefinition
  | typeof MarketDataServiceDefinition
  | typeof MarketDataStreamServiceDefinition
  | typeof OperationsServiceDefinition
  | typeof OperationsStreamServiceDefinition
  | typeof OrdersServiceDefinition
  | typeof OrdersStreamServiceDefinition
  | typeof SandboxServiceDefinition
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
  | StopOrdersServiceClient
  | UsersServiceClient;

export class TinkoffInvestNodeSDK {
  private options: TinkoffInvestOptions;
  private storage: Map<ServiceDefinition, ServiceClient> = new Map();
  private channel: Channel;
  private metadata: Metadata;
  private throttle: Throttle;
  
  constructor(options: TinkoffInvestOptions) {
    this.options = {
      useSsl: true,
      trackLimits: true,
      ...options
    };

    this.throttle = new Throttle(defaultConfig.unaryLimits);
    this.channel = createSdkChannel(this.options);
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

  get stoporders() {
    return this.useServiceAsClient<StopOrdersServiceClient>(StopOrdersServiceDefinition) as StopOrdersService;
  }
  
  get users() {
    return this.useServiceAsClient<UsersServiceClient>(UsersServiceDefinition) as UsersService;
  }

  close(): void {
    this.channel.close();
  }

  private useServiceAsClient<T extends ServiceClient>(service: ServiceDefinition) {
    let client = this.storage.get(service);

    if (!client) {
      client = createSdkClient<ServiceClient>(
        service,
        this.channel,
        this.metadata,
        this.options.trackLimits ?? true,
        this.throttle
      );

      this.storage.set(service, client);
    }

    return client as T;
  }
}
