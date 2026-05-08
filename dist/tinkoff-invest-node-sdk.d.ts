import { Channel, Metadata } from 'nice-grpc';
import { InstrumentsServiceDefinition, InstrumentsServiceClient } from './generated/instruments';
import { MarketDataServiceDefinition, MarketDataServiceClient, MarketDataStreamServiceDefinition, MarketDataStreamServiceClient } from './generated/marketdata';
import { OperationsServiceDefinition, OperationsServiceClient, OperationsStreamServiceDefinition, OperationsStreamServiceClient } from './generated/operations';
import { OrdersServiceDefinition, OrdersServiceClient, OrdersStreamServiceDefinition, OrdersStreamServiceClient } from './generated/orders';
import { SandboxServiceDefinition, SandboxServiceClient } from './generated/sandbox';
import { StopOrdersServiceDefinition, StopOrdersServiceClient } from './generated/stoporders';
import { UsersServiceDefinition, UsersServiceClient } from './generated/users';
import { Throttle } from './throttle';
export interface TinkoffInvestOptions {
    token: string;
    endpoint: string;
    appName?: string;
    useSsl?: boolean;
    trackLimits?: boolean;
}
type ServiceDefinition = typeof InstrumentsServiceDefinition | typeof MarketDataServiceDefinition | typeof MarketDataStreamServiceDefinition | typeof OperationsServiceDefinition | typeof OperationsStreamServiceDefinition | typeof OrdersServiceDefinition | typeof OrdersStreamServiceDefinition | typeof SandboxServiceDefinition | typeof StopOrdersServiceDefinition | typeof UsersServiceDefinition;
type ServiceClient = InstrumentsServiceClient | MarketDataServiceClient | MarketDataStreamServiceClient | OperationsServiceClient | OperationsStreamServiceClient | OrdersServiceClient | OrdersStreamServiceClient | SandboxServiceClient | StopOrdersServiceClient | UsersServiceClient;
export declare class TinkoffInvestNodeSDK {
    protected options: TinkoffInvestOptions;
    protected storage: Map<ServiceDefinition, ServiceClient>;
    protected channel: Channel;
    protected metadata: Metadata;
    protected throttle: Throttle;
    constructor(options: TinkoffInvestOptions);
    get instruments(): InstrumentsServiceClient<{}>;
    get marketdata(): MarketDataServiceClient<{}>;
    get marketdataStream(): MarketDataStreamServiceClient<{}>;
    get operations(): OperationsServiceClient<{}>;
    get operationsStream(): OperationsStreamServiceClient<{}>;
    get orders(): OrdersServiceClient<{}>;
    get ordersStream(): OrdersStreamServiceClient<{}>;
    get sandbox(): SandboxServiceClient<{}>;
    get stoporders(): StopOrdersServiceClient<{}>;
    get users(): UsersServiceClient<{}>;
    close(): void;
    private useServiceAsClient;
}
export {};
