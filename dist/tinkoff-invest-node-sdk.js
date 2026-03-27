"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TinkoffInvestNodeSDK = void 0;
const instruments_1 = require("./generated/instruments");
const marketdata_1 = require("./generated/marketdata");
const operations_1 = require("./generated/operations");
const orders_1 = require("./generated/orders");
const sandbox_1 = require("./generated/sandbox");
const stoporders_1 = require("./generated/stoporders");
const users_1 = require("./generated/users");
const config_1 = require("./config");
const sdk_internals_1 = require("./sdk-internals");
const throttle_1 = require("./throttle");
class TinkoffInvestNodeSDK {
    options;
    // Кэширует лениво созданные клиенты сервисов на время жизни SDK-инстанса.
    storage = new Map();
    channel;
    metadata;
    throttle;
    constructor(options) {
        this.options = {
            useSsl: true,
            trackLimits: true,
            ...options
        };
        this.throttle = new throttle_1.Throttle(config_1.defaultConfig.unaryLimits);
        this.channel = (0, sdk_internals_1.createSdkChannel)(this.options);
        this.metadata = (0, sdk_internals_1.createSdkMetadata)(this.options);
    }
    get instruments() {
        return this.useServiceAsClient(instruments_1.InstrumentsServiceDefinition);
    }
    get marketdata() {
        return this.useServiceAsClient(marketdata_1.MarketDataServiceDefinition);
    }
    get operations() {
        return this.useServiceAsClient(operations_1.OperationsServiceDefinition);
    }
    get orders() {
        return this.useServiceAsClient(orders_1.OrdersServiceDefinition);
    }
    get sandbox() {
        return this.useServiceAsClient(sandbox_1.SandboxServiceDefinition);
    }
    get stoporders() {
        return this.useServiceAsClient(stoporders_1.StopOrdersServiceDefinition);
    }
    get users() {
        return this.useServiceAsClient(users_1.UsersServiceDefinition);
    }
    // Каждый сервис создается один раз и затем переиспользуется.
    useServiceAsClient(service) {
        let client = this.storage.get(service);
        if (!client) {
            client = (0, sdk_internals_1.createSdkClient)(service, this.channel, this.metadata, this.options.trackLimits, this.throttle);
            this.storage.set(service, client);
        }
        return client;
    }
}
exports.TinkoffInvestNodeSDK = TinkoffInvestNodeSDK;
