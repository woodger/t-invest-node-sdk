import {
  Channel, Metadata
} from 'nice-grpc';
import { InstrumentsServiceDefinition, InstrumentsServiceClient } from './generated/instruments';
import {
  MarketDataServiceDefinition,
  MarketDataServiceClient,
  MarketDataStreamServiceDefinition,
  MarketDataStreamServiceClient
} from './generated/marketdata';
import {
  OperationsServiceDefinition,
  OperationsServiceClient,
  OperationsStreamServiceDefinition,
  OperationsStreamServiceClient
} from './generated/operations';
import {
  OrdersServiceDefinition,
  OrdersServiceClient,
  OrdersStreamServiceDefinition,
  OrdersStreamServiceClient
} from './generated/orders';
import { SandboxServiceDefinition, SandboxServiceClient } from './generated/sandbox';
import { StopOrdersServiceDefinition, StopOrdersServiceClient } from './generated/stoporders';
import { UsersServiceDefinition, UsersServiceClient } from './generated/users';
import { defaultConfig } from './config';
import { createSdkChannel, createSdkClient, createSdkMetadata } from './sdk-internals';
import { Throttle } from './throttle';

export interface TinkoffInvestOptions {
  token: string;
  endpoint: string;
  appName?: string;
  useSsl?: boolean;
  trackLimits?: boolean;
}

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
  protected options: TinkoffInvestOptions;
  // Кэширует лениво созданные клиенты сервисов на время жизни SDK-инстанса.
  protected storage: Map<ServiceDefinition, ServiceClient> = new Map();
  protected channel: Channel;
  protected metadata: Metadata;
  protected throttle: Throttle;
  
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
    return this.useServiceAsClient<InstrumentsServiceClient>(InstrumentsServiceDefinition);
  }
  
  get marketdata() {
    return this.useServiceAsClient<MarketDataServiceClient>(MarketDataServiceDefinition);
  }

  get marketdataStream() {
    return this.useServiceAsClient<MarketDataStreamServiceClient>(MarketDataStreamServiceDefinition);
  }

  get operations() {
    return this.useServiceAsClient<OperationsServiceClient>(OperationsServiceDefinition);
  }

  get operationsStream() {
    return this.useServiceAsClient<OperationsStreamServiceClient>(OperationsStreamServiceDefinition);
  }
  
  get orders() {
    return this.useServiceAsClient<OrdersServiceClient>(OrdersServiceDefinition);
  }

  get ordersStream() {
    return this.useServiceAsClient<OrdersStreamServiceClient>(OrdersStreamServiceDefinition);
  }

  get sandbox() {
    return this.useServiceAsClient<SandboxServiceClient>(SandboxServiceDefinition);
  }

  get stoporders() {
    return this.useServiceAsClient<StopOrdersServiceClient>(StopOrdersServiceDefinition);
  }
  
  get users() {
    return this.useServiceAsClient<UsersServiceClient>(UsersServiceDefinition);
  }

  close(): void {
    this.channel.close();
  }

  // Каждый сервис создается один раз и затем переиспользуется.
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
