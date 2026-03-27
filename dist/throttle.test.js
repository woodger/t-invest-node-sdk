"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = __importDefault(require("node:test"));
const throttle_1 = require("./throttle");
(0, node_test_1.default)('resolveLimit returns the configured limit for a matching path', () => {
    const throttle = new throttle_1.Throttle({
        MarketDataService: 300
    });
    node_assert_1.default.equal(throttle.resolveLimit('/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles'), 300);
});
(0, node_test_1.default)('resolveLimit returns undefined for an unknown path', () => {
    const throttle = new throttle_1.Throttle({
        KnownService: 100
    });
    node_assert_1.default.equal(throttle.resolveLimit('/tinkoff.public.invest.api.contract.v1.UnknownService/Get'), undefined);
});
(0, node_test_1.default)('resolveLimit prefers the most specific matching key for overlapping routes', () => {
    const throttle = new throttle_1.Throttle({
        OrdersService: 100,
        '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders': 200
    });
    node_assert_1.default.equal(throttle.resolveLimit('/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders'), 200);
});
(0, node_test_1.default)('resolveLimit does not depend on object key order for overlapping routes', () => {
    const throttle = new throttle_1.Throttle({
        '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders': 200,
        OrdersService: 100
    });
    node_assert_1.default.equal(throttle.resolveLimit('/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders'), 200);
});
(0, node_test_1.default)('throws for unknown unary limit path', async () => {
    const throttle = new throttle_1.Throttle({
        KnownService: 100
    });
    await node_assert_1.default.rejects(throttle.reduce('/tinkoff.public.invest.api.contract.v1.UnknownService/Get'), /Unhandled unary limits/);
});
(0, node_test_1.default)('does not wait on the first request for a known path', async () => {
    const throttle = new throttle_1.Throttle({
        MarketDataService: 300
    });
    const originalSetTimeout = global.setTimeout;
    let timeoutCalls = 0;
    global.setTimeout = ((callback) => {
        timeoutCalls += 1;
        callback();
        return 0;
    });
    try {
        await throttle.reduce('/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles');
        node_assert_1.default.equal(timeoutCalls, 0);
    }
    finally {
        global.setTimeout = originalSetTimeout;
    }
});
(0, node_test_1.default)('waits according to the configured limit between requests', async () => {
    const throttle = new throttle_1.Throttle({
        OrdersService: 100
    });
    const originalDate = global.Date;
    const originalSetTimeout = global.setTimeout;
    const now = 10_000;
    const delays = [];
    class FakeDate extends Date {
        constructor(value) {
            super(value ?? now);
        }
    }
    global.Date = FakeDate;
    global.setTimeout = ((callback, delay) => {
        delays.push(delay ?? 0);
        callback();
        return 0;
    });
    try {
        await throttle.reduce('/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState');
        await throttle.reduce('/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState');
        node_assert_1.default.deepEqual(delays, [600]);
    }
    finally {
        global.Date = originalDate;
        global.setTimeout = originalSetTimeout;
    }
});
