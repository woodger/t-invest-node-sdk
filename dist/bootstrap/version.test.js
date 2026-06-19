"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = require("node:test");
const version_1 = require("./version");
function argv(args) {
    return {
        _: [],
        ...args
    };
}
(0, node_test_1.describe)('version', () => {
    (0, node_test_1.test)('exposes package version', () => {
        node_assert_1.default.match(version_1.appVersion, /^\d+\.\d+\.\d+/);
    });
    (0, node_test_1.test)('detects version flag aliases', () => {
        node_assert_1.default.equal((0, version_1.isVersionRequested)(argv({ version: true })), true);
        node_assert_1.default.equal((0, version_1.isVersionRequested)(argv({ v: true })), true);
        node_assert_1.default.equal((0, version_1.isVersionRequested)(argv({ version: false })), false);
    });
    (0, node_test_1.test)('renders detailed version info', () => {
        const version = (0, version_1.renderVersionInfo)();
        node_assert_1.default.match(version, /^tinkoff-invest-node-sdk \d+\.\d+\.\d+/);
        node_assert_1.default.match(version, /node v\d+/);
        node_assert_1.default.match(version, /platform /);
    });
});
