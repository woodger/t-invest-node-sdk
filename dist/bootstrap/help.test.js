"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = require("node:test");
const help_1 = require("./help");
function argv(args) {
    return {
        _: [],
        ...args
    };
}
(0, node_test_1.describe)('help', () => {
    (0, node_test_1.test)('detects help flag aliases', () => {
        node_assert_1.default.equal((0, help_1.isHelpRequested)(argv({ help: true })), true);
        node_assert_1.default.equal((0, help_1.isHelpRequested)(argv({ h: true })), true);
        node_assert_1.default.equal((0, help_1.isHelpRequested)(argv({ help: false })), false);
    });
    (0, node_test_1.test)('renders top-level help page', () => {
        const help = (0, help_1.renderCliHelp)();
        node_assert_1.default.match(help, /^tinkoff-invest-node-sdk \d+\.\d+\.\d+/);
        node_assert_1.default.match(help, /Usage:/);
        node_assert_1.default.match(help, /Global options:/);
        node_assert_1.default.match(help, /Commands:/);
        node_assert_1.default.match(help, /version/);
        node_assert_1.default.doesNotMatch(help, /Environment:/);
    });
    (0, node_test_1.test)('renders command-specific help from command help flag', () => {
        const help = (0, help_1.renderHelp)(argv({
            _: ['version'],
            help: true
        }));
        node_assert_1.default.match(help, /version - Show package and runtime version info/);
        node_assert_1.default.match(help, /tinkoff-invest-node-sdk version/);
        node_assert_1.default.doesNotMatch(help, /Commands:/);
    });
    (0, node_test_1.test)('keeps top-level help for unknown command help', () => {
        const help = (0, help_1.renderHelp)(argv({
            _: ['unknown'],
            help: true
        }));
        node_assert_1.default.match(help, /Commands:/);
        node_assert_1.default.match(help, /tinkoff-invest-node-sdk <command> --help/);
    });
    (0, node_test_1.test)('renders direct command help', () => {
        const help = (0, help_1.renderCommandHelp)('help');
        node_assert_1.default.match(help, /help - Show top-level or command-specific help/);
        node_assert_1.default.match(help, /tinkoff-invest-node-sdk help <command>/);
    });
});
