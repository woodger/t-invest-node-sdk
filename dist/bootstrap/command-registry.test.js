"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = require("node:test");
const command_registry_1 = require("./command-registry");
(0, node_test_1.describe)('resolveCommand', () => {
    (0, node_test_1.test)('resolves help command without context requirement', () => {
        const command = (0, command_registry_1.resolveCommand)('help');
        node_assert_1.default.equal(command.requiresContext, false);
        node_assert_1.default.equal(typeof command.handler, 'function');
    });
    (0, node_test_1.test)('resolves version command without context requirement', () => {
        const command = (0, command_registry_1.resolveCommand)('version');
        node_assert_1.default.equal(command.requiresContext, false);
        node_assert_1.default.equal(typeof command.handler, 'function');
    });
    (0, node_test_1.test)('throws for unknown command', () => {
        node_assert_1.default.throws(() => (0, command_registry_1.resolveCommand)('unknown-command'), /is not a program command/);
    });
});
(0, node_test_1.describe)('isCommandName', () => {
    (0, node_test_1.test)('accepts registered command names only', () => {
        node_assert_1.default.equal((0, command_registry_1.isCommandName)('help'), true);
        node_assert_1.default.equal((0, command_registry_1.isCommandName)('version'), true);
        node_assert_1.default.equal((0, command_registry_1.isCommandName)('accounts'), false);
        node_assert_1.default.equal((0, command_registry_1.isCommandName)(undefined), false);
    });
});
