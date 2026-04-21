"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = __importDefault(require("node:test"));
const sdk_internals_1 = require("./sdk-internals");
const throttle_1 = require("./throttle");
function createUnaryResponseIterator(response) {
    const iterator = {
        async next() {
            return { done: true, value: response };
        },
        [Symbol.asyncIterator]() {
            return iterator;
        }
    };
    return iterator;
}
function createUnaryCall(path) {
    return {
        request: {},
        responseStream: false,
        method: { path },
        next() {
            return createUnaryResponseIterator({ ok: true });
        }
    };
}
(0, node_test_1.default)('middleware uses throttle from the current sdk instance', async () => {
    const throttleA = new throttle_1.Throttle({});
    const throttleB = new throttle_1.Throttle({});
    let callsA = 0;
    let callsB = 0;
    throttleA.reduce = async (path) => {
        callsA += 1;
        node_assert_1.default.equal(path, '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts');
    };
    throttleB.reduce = async (path) => {
        callsB += 1;
        node_assert_1.default.equal(path, '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts');
    };
    const middlewareA = (0, sdk_internals_1.createSdkMiddleware)(true, throttleA);
    const middlewareB = (0, sdk_internals_1.createSdkMiddleware)(true, throttleB);
    await middlewareA(createUnaryCall('/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts'), {}).next();
    await middlewareB(createUnaryCall('/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts'), {}).next();
    node_assert_1.default.equal(callsA, 1);
    node_assert_1.default.equal(callsB, 1);
});
(0, node_test_1.default)('middleware skips throttle when trackLimits is disabled', async () => {
    const throttle = new throttle_1.Throttle({});
    let throttleCalls = 0;
    throttle.reduce = async () => {
        throttleCalls += 1;
    };
    const middleware = (0, sdk_internals_1.createSdkMiddleware)(false, throttle);
    await middleware(createUnaryCall('/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts'), {}).next();
    node_assert_1.default.equal(throttleCalls, 0);
});
