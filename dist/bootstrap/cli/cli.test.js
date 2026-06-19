"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = require("node:test");
const help_1 = require("../help");
const cli_1 = require("./cli");
function createIo() {
    let stdout = '';
    let stderr = '';
    return {
        io: {
            stdout: {
                write(chunk) {
                    stdout += chunk;
                }
            },
            stderr: {
                write(chunk) {
                    stderr += chunk;
                }
            }
        },
        read() {
            return {
                stdout,
                stderr
            };
        }
    };
}
(0, node_test_1.describe)('bootstrap cli', () => {
    (0, node_test_1.describe)('parseCliArgs', () => {
        (0, node_test_1.test)('maps help and version flag aliases', () => {
            node_assert_1.default.deepEqual((0, cli_1.parseCliArgs)(['version', '--help', '-v']), {
                _: ['version'],
                help: true,
                v: true
            });
        });
        (0, node_test_1.test)('maps long options with values and boolean flags', () => {
            node_assert_1.default.deepEqual((0, cli_1.parseCliArgs)([
                'accounts',
                '--token=secret',
                '--endpoint=invest.example:443',
                '--insecure'
            ]), {
                _: ['accounts'],
                token: 'secret',
                endpoint: 'invest.example:443',
                insecure: true
            });
        });
    });
    (0, node_test_1.describe)('runCli', () => {
        (0, node_test_1.test)('prints help when no command is provided', async () => {
            const { io, read } = createIo();
            const exitCode = await (0, cli_1.runCli)([], io);
            node_assert_1.default.equal(exitCode, 0);
            node_assert_1.default.match(read().stdout, /Usage:/);
            node_assert_1.default.equal(read().stderr, '');
        });
        (0, node_test_1.test)('prints top-level help from help command and global flags', async () => {
            for (const command of ['--help', '-h', 'help']) {
                const { io, read } = createIo();
                const exitCode = await (0, cli_1.runCli)([command], io);
                node_assert_1.default.equal(exitCode, 0);
                node_assert_1.default.match(read().stdout, /Commands:/);
                node_assert_1.default.equal(read().stderr, '');
            }
        });
        (0, node_test_1.test)('prints command-specific help from a command help flag', async () => {
            const { io, read } = createIo();
            const exitCode = await (0, cli_1.runCli)(['version', '--help'], io);
            node_assert_1.default.equal(exitCode, 0);
            node_assert_1.default.match(read().stdout, /version - Show package and runtime version info/);
            node_assert_1.default.match(read().stdout, /tinkoff-invest-node-sdk --version/);
            node_assert_1.default.equal(read().stderr, '');
        });
        (0, node_test_1.test)('prints version from version command and global flag', async () => {
            for (const command of ['version', '--version']) {
                const { io, read } = createIo();
                const exitCode = await (0, cli_1.runCli)([command], io);
                node_assert_1.default.equal(exitCode, 0);
                node_assert_1.default.match(read().stdout, /^tinkoff-invest-node-sdk \d+\.\d+\.\d+/);
                node_assert_1.default.match(read().stdout, /node v\d+/);
                node_assert_1.default.equal(read().stderr, '');
            }
        });
        (0, node_test_1.test)('returns a failure for unknown commands', async () => {
            const { io, read } = createIo();
            const exitCode = await (0, cli_1.runCli)(['accounts'], io);
            node_assert_1.default.equal(exitCode, 1);
            node_assert_1.default.equal(read().stdout, '');
            node_assert_1.default.match(read().stderr, /Unknown command: accounts/);
            node_assert_1.default.match(read().stderr, /Usage:/);
        });
    });
    (0, node_test_1.describe)('renderCliHelp', () => {
        (0, node_test_1.test)('renders top-level help', () => {
            const help = (0, help_1.renderCliHelp)();
            node_assert_1.default.match(help, /Usage:/);
            node_assert_1.default.match(help, /Global options:/);
            node_assert_1.default.match(help, /Commands:/);
            node_assert_1.default.match(help, /tinkoff-invest-node-sdk --help/);
            node_assert_1.default.doesNotMatch(help, /Examples:/);
        });
    });
});
