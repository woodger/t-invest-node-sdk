"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = require("node:test");
const unary_throttle_service_1 = require("../../application/services/unary-throttle.service");
const users_1 = require("../../generated/users");
const index_1 = require("./index");
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
function createUnaryCall(path, response = { ok: true }) {
    return {
        request: {},
        responseStream: false,
        method: { path },
        next() {
            return createUnaryResponseIterator(response);
        }
    };
}
function createResponseStreamCall(path, responses) {
    return {
        request: {},
        responseStream: true,
        method: { path },
        next: async function* () {
            for (const response of responses) {
                yield response;
            }
        }
    };
}
(0, node_test_1.describe)('infrastructure grpc', () => {
    (0, node_test_1.describe)('createSdkMetadata', () => {
        (0, node_test_1.test)('adds authorization header', () => {
            const metadata = (0, index_1.createSdkMetadata)({
                token: 'token',
                endpoint: 'localhost:50051'
            });
            node_assert_1.default.equal(metadata.get('Authorization'), 'Bearer token');
            node_assert_1.default.equal(metadata.get('x-app-name'), undefined);
        });
        (0, node_test_1.test)('adds x-app-name when it is provided', () => {
            const metadata = (0, index_1.createSdkMetadata)({
                token: 'token',
                endpoint: 'localhost:50051',
                appName: 'sdk-app'
            });
            node_assert_1.default.equal(metadata.get('Authorization'), 'Bearer token');
            node_assert_1.default.equal(metadata.get('x-app-name'), 'sdk-app');
        });
    });
    (0, node_test_1.describe)('createSdkMiddleware', () => {
        (0, node_test_1.test)('throttles unary calls when trackLimits is enabled', async () => {
            const throttle = new unary_throttle_service_1.Throttle({});
            let throttleCalls = 0;
            throttle.reduce = async (path) => {
                throttleCalls += 1;
                node_assert_1.default.equal(path, '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts');
            };
            const middleware = (0, index_1.createSdkMiddleware)(true, throttle);
            const iterator = middleware(createUnaryCall('/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts'), {});
            const result = await iterator.next();
            node_assert_1.default.equal(throttleCalls, 1);
            node_assert_1.default.deepEqual(result, {
                done: true,
                value: { ok: true }
            });
        });
        (0, node_test_1.test)('does not throttle response streams', async () => {
            const throttle = new unary_throttle_service_1.Throttle({});
            let throttleCalls = 0;
            throttle.reduce = async () => {
                throttleCalls += 1;
            };
            const middleware = (0, index_1.createSdkMiddleware)(true, throttle);
            const iterator = middleware(createResponseStreamCall('/tinkoff.public.invest.api.contract.v1.OperationsStreamService/PortfolioStream', [
                { seq: 1 },
                { seq: 2 }
            ]), {});
            const responses = [];
            for await (const response of iterator) {
                responses.push(response);
            }
            node_assert_1.default.equal(throttleCalls, 0);
            node_assert_1.default.deepEqual(responses, [{ seq: 1 }, { seq: 2 }]);
        });
    });
    (0, node_test_1.describe)('createSdkChannel', () => {
        (0, node_test_1.test)('creates a channel object for the configured endpoint', () => {
            const channel = (0, index_1.createSdkChannel)({
                token: 'token',
                endpoint: 'localhost:50051',
                useSsl: false
            });
            node_assert_1.default.ok(channel);
            node_assert_1.default.equal(typeof channel.close, 'function');
        });
    });
    (0, node_test_1.describe)('createSdkClient', () => {
        (0, node_test_1.test)('creates a typed client for the service definition', () => {
            const channel = (0, index_1.createSdkChannel)({
                token: 'token',
                endpoint: 'localhost:50051',
                useSsl: false
            });
            const metadata = (0, index_1.createSdkMetadata)({
                token: 'token',
                endpoint: 'localhost:50051'
            });
            const throttle = new unary_throttle_service_1.Throttle({});
            const client = (0, index_1.createSdkClient)(users_1.UsersServiceDefinition, channel, metadata, true, throttle);
            node_assert_1.default.equal(typeof client.getAccounts, 'function');
        });
    });
});
