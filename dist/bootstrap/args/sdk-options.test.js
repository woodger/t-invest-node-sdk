"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = require("node:test");
const sdk_options_1 = require("./sdk-options");
function argv(args = {}) {
    return {
        _: [],
        ...args
    };
}
(0, node_test_1.describe)('resolveSdkOptions', () => {
    (0, node_test_1.test)('prefers explicit CLI values over environment values', () => {
        const options = (0, sdk_options_1.resolveSdkOptions)(argv({
            token: 'cli-token',
            endpoint: 'cli.example:443',
            'app-name': 'cli-app'
        }), {
            TINKOFF_TOKEN: 'env-token',
            TINKOFF_ENDPOINT: 'env.example:443'
        });
        node_assert_1.default.deepEqual(options, {
            token: 'cli-token',
            endpoint: 'cli.example:443',
            appName: 'cli-app'
        });
    });
    (0, node_test_1.test)('falls back to environment token and endpoint', () => {
        const options = (0, sdk_options_1.resolveSdkOptions)(argv(), {
            TINKOFF_TOKEN: 'env-token',
            TINKOFF_ENDPOINT: 'env.example:443'
        });
        node_assert_1.default.deepEqual(options, {
            token: 'env-token',
            endpoint: 'env.example:443'
        });
    });
    (0, node_test_1.test)('maps insecure flag to disabled ssl', () => {
        const options = (0, sdk_options_1.resolveSdkOptions)(argv({
            token: 'token',
            endpoint: 'localhost:50051',
            insecure: true
        }), {});
        node_assert_1.default.equal(options.useSsl, false);
    });
    (0, node_test_1.test)('throws when required token is missing', () => {
        node_assert_1.default.throws(() => (0, sdk_options_1.resolveSdkOptions)(argv({ endpoint: 'localhost:50051' }), {}), /Expected '--token' or TINKOFF_TOKEN/);
    });
    (0, node_test_1.test)('rejects boolean flag form for value options', () => {
        node_assert_1.default.throws(() => (0, sdk_options_1.resolveSdkOptions)(argv({
            token: true,
            endpoint: 'localhost:50051'
        }), {}), /Expected '--token' as string/);
    });
});
(0, node_test_1.describe)('sdkOptionArgNames', () => {
    (0, node_test_1.test)('lists shared SDK option names for command-level known-arg checks', () => {
        node_assert_1.default.equal(sdk_options_1.sdkOptionArgNames.has('token'), true);
        node_assert_1.default.equal(sdk_options_1.sdkOptionArgNames.has('endpoint'), true);
        node_assert_1.default.equal(sdk_options_1.sdkOptionArgNames.has('app-name'), true);
        node_assert_1.default.equal(sdk_options_1.sdkOptionArgNames.has('insecure'), true);
    });
});
