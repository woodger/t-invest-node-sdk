import { Channel, Metadata } from 'nice-grpc';
import { InstrumentsServiceDefinition, InstrumentsServiceClient } from './generated/instruments';
import { MarketDataServiceDefinition, MarketDataServiceClient } from './generated/marketdata';
import { OperationsServiceDefinition, OperationsServiceClient } from './generated/operations';
import { OrdersServiceDefinition, OrdersServiceClient } from './generated/orders';
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
type ServiceDefinition = typeof InstrumentsServiceDefinition | typeof MarketDataServiceDefinition | typeof OperationsServiceDefinition | typeof OrdersServiceDefinition | typeof SandboxServiceDefinition | typeof StopOrdersServiceDefinition | typeof UsersServiceDefinition;
type ServiceClient = InstrumentsServiceClient | MarketDataServiceClient | OperationsServiceClient | OrdersServiceClient | SandboxServiceClient | StopOrdersServiceClient | UsersServiceClient;
export declare class TinkoffInvestNodeSDK {
    protected options: TinkoffInvestOptions;
    protected storage: Map<ServiceDefinition, ServiceClient>;
    protected channel: Channel;
    protected metadata: Metadata;
    protected throttle: Throttle;
    constructor(options: TinkoffInvestOptions);
    get instruments(): InstrumentsServiceClient<{}>;
    get marketdata(): MarketDataServiceClient<{}>;
    get operations(): OperationsServiceClient<{}>;
    get orders(): OrdersServiceClient<{}>;
    get sandbox(): SandboxServiceClient<{}>;
    get stoporders(): StopOrdersServiceClient<{}>;
    get users(): UsersServiceClient<{}>;
    private useServiceAsClient;
}
export {};
