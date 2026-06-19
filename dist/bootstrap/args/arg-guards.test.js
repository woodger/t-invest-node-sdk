"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = require("node:test");
const arg_guards_1 = require("./arg-guards");
function argv(args = {}) {
    return {
        _: [],
        ...args
    };
}
(0, node_test_1.describe)('ArgGuards', () => {
    (0, node_test_1.describe)('requireStringArg', () => {
        (0, node_test_1.test)('returns non-empty string argument', () => {
            node_assert_1.default.equal(arg_guards_1.ArgGuards.requireStringArg(argv({ token: 'secret' }), 'token'), 'secret');
        });
        (0, node_test_1.test)('throws when required string argument is absent or blank', () => {
            node_assert_1.default.throws(() => arg_guards_1.ArgGuards.requireStringArg(argv(), 'token'), /Expected required argument '--token'/);
            node_assert_1.default.throws(() => arg_guards_1.ArgGuards.requireStringArg(argv({ token: '   ' }), 'token'), /Expected required argument '--token'/);
        });
    });
    (0, node_test_1.describe)('optionalStringArgValue', () => {
        (0, node_test_1.test)('returns undefined when argument is absent', () => {
            node_assert_1.default.equal(arg_guards_1.ArgGuards.optionalStringArgValue(argv(), 'app-name'), undefined);
        });
        (0, node_test_1.test)('rejects boolean flag form', () => {
            node_assert_1.default.throws(() => arg_guards_1.ArgGuards.optionalStringArgValue(argv({ token: true }), 'token'), /Expected '--token' as string/);
        });
    });
    (0, node_test_1.describe)('optionalBooleanFlagArg', () => {
        (0, node_test_1.test)('returns true only for boolean flag form', () => {
            node_assert_1.default.equal(arg_guards_1.ArgGuards.optionalBooleanFlagArg(argv({ insecure: true }), 'insecure'), true);
            node_assert_1.default.equal(arg_guards_1.ArgGuards.optionalBooleanFlagArg(argv(), 'insecure'), undefined);
        });
        (0, node_test_1.test)('rejects explicit boolean flag values', () => {
            node_assert_1.default.throws(() => arg_guards_1.ArgGuards.optionalBooleanFlagArg(argv({ insecure: 'true' }), 'insecure'), /Expected '--insecure' as boolean flag/);
        });
    });
    (0, node_test_1.describe)('optionalEnumArgValue', () => {
        (0, node_test_1.test)('returns whitelisted enum values', () => {
            node_assert_1.default.equal(arg_guards_1.ArgGuards.optionalEnumArgValue(argv({ format: 'json' }), 'format', ['json', 'table']), 'json');
        });
        (0, node_test_1.test)('throws for unknown enum values', () => {
            node_assert_1.default.throws(() => arg_guards_1.ArgGuards.optionalEnumArgValue(argv({ format: 'xml' }), 'format', ['json', 'table']), /Expected '--format' as one of: json, table/);
        });
    });
    (0, node_test_1.describe)('parseDateArg', () => {
        (0, node_test_1.test)('returns parsed date', () => {
            const date = arg_guards_1.ArgGuards.parseDateArg(argv({ from: '2026-06-19T00:00:00.000Z' }), 'from');
            node_assert_1.default.equal(date.toISOString(), '2026-06-19T00:00:00.000Z');
        });
        (0, node_test_1.test)('throws when date argument is invalid', () => {
            node_assert_1.default.throws(() => arg_guards_1.ArgGuards.parseDateArg(argv({ from: 'not-a-date' }), 'from'), /Expected '--from' as date-time/);
        });
    });
    (0, node_test_1.describe)('assertKnownArgs', () => {
        (0, node_test_1.test)('ignores positional arguments and accepts known options', () => {
            node_assert_1.default.doesNotThrow(() => {
                arg_guards_1.ArgGuards.assertKnownArgs(argv({
                    _: ['accounts'],
                    token: 'secret'
                }), new Set(['token']));
            });
        });
        (0, node_test_1.test)('throws for unexpected named options', () => {
            node_assert_1.default.throws(() => arg_guards_1.ArgGuards.assertKnownArgs(argv({ unexpected: true }), new Set()), /Unexpected argument '--unexpected'/);
        });
    });
});
