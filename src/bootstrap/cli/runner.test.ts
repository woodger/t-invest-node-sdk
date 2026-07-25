import assert from 'node:assert';
import { describe, test } from 'node:test';
import { createOutput } from 'icore';
import { parseCliInput, runCli } from './runner';

function createIo() {
  let stdout = '';
  let stderr = '';

  return {
    io: createOutput({
      stdout: {
        write(chunk: string) {
          stdout += chunk;
        }
      },
      stderr: {
        write(chunk: string) {
          stderr += chunk;
        }
      }
    }),
    read() {
      return {
        stdout,
        stderr
      };
    }
  };
}

describe('bootstrap cli runner', () => {
  describe('parseCliInput', () => {
    test('maps help and version flag aliases', () => {
      assert.deepEqual(
        parseCliInput(['version', '--help', '-v']),
        {
          positionals: ['version'],
          options: {
            help: true,
            version: true
          }
        }
      );
    });

    test('maps long options with values and boolean flags', () => {
      assert.deepEqual(
        parseCliInput([
          'users',
          'get-accounts',
          '--format',
          'json',
          '--token=secret',
          '--endpoint=invest.example:443',
          '--insecure'
        ]),
        {
          positionals: ['users', 'get-accounts'],
          options: {
            format: 'json',
            token: 'secret',
            endpoint: 'invest.example:443',
            insecure: true
          }
        }
      );
    });

    test('does not consume values after known boolean flags', () => {
      assert.deepEqual(
        parseCliInput(['--help', 'users', 'get-accounts', '--version', 'marketdata', 'get-candles']),
        {
          positionals: ['users', 'get-accounts', 'marketdata', 'get-candles'],
          options: {
            help: true,
            version: true
          }
        }
      );
    });

    test('rejects undocumented long forms of short aliases', () => {
      for (const [argument, replacement] of [
        ['--h', /use '--help' or '-h'/],
        ['--no-h', /use '--help' or '-h'/],
        ['--v', /use '--version' or '-v'/],
        ['--no-v', /use '--version' or '-v'/]
      ] as const) {
        assert.throws(
          () => parseCliInput([argument]),
          replacement
        );
      }
    });

    test('rejects assigned values for global boolean flags', () => {
      assert.throws(
        () => parseCliInput(['--help=false']),
        /Expected '--help' as boolean flag/
      );
      assert.throws(
        () => parseCliInput(['users', 'get-accounts', '--insecure=true']),
        /Expected '--insecure' as boolean flag/
      );
    });
  });

  describe('runCli', () => {
    test('prints help when no command is provided', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli([], io);

      assert.equal(exitCode, 0);
      assert.match(read().stdout, /Usage:/);
      assert.equal(read().stderr, '');
    });

    test('prints top-level help from help command and global flags', async () => {
      for (const command of ['--help', '-h', 'help']) {
        const { io, read } = createIo();
        const exitCode = await runCli([command], io);

        assert.equal(exitCode, 0);
        assert.match(read().stdout, /Domains:/);
        assert.match(read().stdout, /account\s+Accounts, user info, tariff and limits/);
        assert.doesNotMatch(read().stdout, /users get-accounts/);
        assert.equal(read().stderr, '');
      }
    });

    test('prints command-specific help from a command help flag', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['operation', 'portfolio', '--help'], io);

      assert.equal(exitCode, 0);
      assert.match(read().stdout, /operation portfolio - Print account portfolio/);
      assert.match(read().stdout, /SDK call:\n {2}sdk\.operations\.getPortfolio/);
      assert.match(read().stdout, /tinkoff-invest-node-sdk operation portfolio --account-id=ID/);
      assert.equal(read().stderr, '');
    });

    test('prints sandbox preferred command help from technical command help flags', async () => {
      for (const { path, title, usage } of [
        {
          path: ['sandbox', 'get-sandbox-accounts'],
          title: /sandbox account list - Print sandbox accounts/,
          usage: /tinkoff-invest-node-sdk sandbox account list/
        },
        {
          path: ['sandbox', 'post-sandbox-order'],
          title: /sandbox order place - Post a sandbox order/,
          usage: /tinkoff-invest-node-sdk sandbox order place --account-id=ID/
        },
        {
          path: ['sandbox', 'sandbox-pay-in'],
          title: /sandbox pay-in - Pay in to a sandbox account/,
          usage: /tinkoff-invest-node-sdk sandbox pay-in --account-id=ID/
        }
      ] as const) {
        const { io, read } = createIo();
        const exitCode = await runCli([...path, '--help'], io);

        assert.equal(exitCode, 0);
        assert.match(read().stdout, title);
        assert.match(read().stdout, usage);
        assert.equal(read().stderr, '');
      }
    });

    test('prints preferred command help from a legacy command help flag', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['operations', 'get-portfolio', '--help'], io);

      assert.equal(exitCode, 0);
      assert.match(read().stdout, /operation portfolio - Print account portfolio/);
      assert.match(read().stdout, /tinkoff-invest-node-sdk operation portfolio --account-id=ID/);
      assert.doesNotMatch(read().stdout, /tinkoff-invest-node-sdk operation get-portfolio --account-id=ID/);
      assert.doesNotMatch(read().stdout, /tinkoff-invest-node-sdk operations get-portfolio --account-id=ID/);
      assert.equal(read().stderr, '');
    });

    test('prints domain-level help from domain help flag', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['account', '--help'], io);

      assert.equal(exitCode, 0);
      assert.match(read().stdout, /account - Accounts, user info, tariff and limits/);
      assert.match(read().stdout, /list\s+Print user accounts/);
      assert.doesNotMatch(read().stdout, /users get-accounts/);
      assert.doesNotMatch(read().stdout, /get-accounts\s+Print user accounts/);
      assert.equal(read().stderr, '');
    });

    test('prints command-specific help from help command argument', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['help', 'market', 'get-candles'], io);

      assert.equal(exitCode, 0);
      assert.match(read().stdout, /market candles - Print historical candles/);
      assert.match(read().stdout, /gRPC method:\n {2}MarketDataService\/GetCandles/);
      assert.match(read().stdout, /tinkoff-invest-node-sdk market candles --instrument-id=ID/);
      assert.doesNotMatch(read().stdout, /tinkoff-invest-node-sdk market get-candles --instrument-id=ID/);
      assert.equal(read().stderr, '');
    });

    test('prints utility help from help command argument', async () => {
      for (const [command, output] of [
        ['version', /version - Show package and runtime version info/],
        ['compile-proto', /dev compile-proto - Generate TypeScript contracts/]
      ] as const) {
        const { io, read } = createIo();
        const exitCode = await runCli(['help', command], io);

        assert.equal(exitCode, 0);
        assert.match(read().stdout, output);
        assert.equal(read().stderr, '');
      }
    });

    test('prints version from version command and global flag', async () => {
      for (const command of ['version', '--version', '-v']) {
        const { io, read } = createIo();
        const exitCode = await runCli([command], io);

        assert.equal(exitCode, 0);
        assert.match(read().stdout, /^tinkoff-invest-node-sdk \d+\.\d+\.\d+/);
        assert.match(read().stdout, /node v\d+/);
        assert.equal(read().stderr, '');
      }
    });

    test('returns a usage failure for undocumented long forms of short aliases', async () => {
      for (const [argument, replacement] of [
        ['--h', /use '--help' or '-h'/],
        ['--v', /use '--version' or '-v'/]
      ] as const) {
        const { io, read } = createIo();
        const exitCode = await runCli([argument], io);

        assert.equal(exitCode, 2);
        assert.equal(read().stdout, '');
        assert.match(read().stderr, replacement);
      }
    });

    test('returns a failure for assigned global boolean flag values', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['--help=false'], io);

      assert.equal(exitCode, 2);
      assert.equal(read().stdout, '');
      assert.match(read().stderr, /Expected '--help' as boolean flag/);
    });

    test('reports bootstrap output write failures through terminal error policy', async () => {
      let stderr = '';
      const exitCode = await runCli(['--version'], createOutput({
        stdout: {
          write() {
            throw new Error('stdout failed');
          }
        },
        stderr: {
          write(chunk: string) {
            stderr += chunk;
          }
        }
      }));

      assert.equal(exitCode, 1);
      assert.equal(stderr, 'stdout failed\n');
    });

    test('keeps legacy command paths executable through the runner', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['users', 'get-accounts', '--format=xml'], io);

      assert.equal(exitCode, 2);
      assert.equal(read().stdout, '');
      assert.match(read().stderr, /Expected '--format' as one of: json, table/);
    });

    test('keeps friendly command paths executable through the runner', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['account', 'list', '--format=xml'], io);

      assert.equal(exitCode, 2);
      assert.equal(read().stdout, '');
      assert.match(read().stderr, /Expected '--format' as one of: json, table/);
    });

    test('rejects extra command positionals during prepare', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['account', 'list', 'unexpected'], io);

      assert.equal(exitCode, 2);
      assert.equal(read().stdout, '');
      assert.match(
        read().stderr,
        /Unexpected positional argument for 'account list': unexpected/
      );
    });

    test('waits for async stdout writes', async () => {
      let finishWrite: (() => void) | undefined;
      let commandFinished = false;
      const exitCode = runCli(['version'], createOutput({
        stdout: {
          write() {
            return new Promise<void>((resolve) => {
              finishWrite = resolve;
            });
          }
        },
        stderr: {
          write() {}
        }
      })).then((code) => {
        commandFinished = true;

        return code;
      });

      await new Promise<void>((resolve) => {
        setImmediate(resolve);
      });

      assert.equal(commandFinished, false);

      if (finishWrite === undefined) {
        throw new Error('Expected stdout write to start');
      }

      finishWrite();

      assert.equal(await exitCode, 0);
      assert.equal(commandFinished, true);
    });

    test('returns a failure for unknown commands', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['unknown-command'], io);

      assert.equal(exitCode, 2);
      assert.equal(read().stdout, '');
      assert.match(read().stderr, /Unknown command: unknown-command/);
      assert.match(read().stderr, /Usage:/);
    });

    test('prints deprecated figi option warnings to stderr', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli([
        'instrument',
        'get-futures-margin',
        '--figi=FUTFIGI'
      ], io);

      assert.equal(exitCode, 2);
      assert.equal(read().stdout, '');
      assert.match(read().stderr, /Warning: '--figi' is deprecated/);
      assert.match(read().stderr, /use '--instrument-id' instead/);
      assert.match(read().stderr, /Expected '--token' or TINKOFF_TOKEN/);
    });

    test('does not warn for canonical instrument-id option', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli([
        'instrument',
        'get-futures-margin',
        '--instrument-id=FUTFIGI'
      ], io);

      assert.equal(exitCode, 2);
      assert.equal(read().stdout, '');
      assert.doesNotMatch(read().stderr, /deprecated/);
      assert.match(read().stderr, /Expected '--token' or TINKOFF_TOKEN/);
    });

    test('waits for async stderr writes', async () => {
      let finishWrite: (() => void) | undefined;
      let commandFinished = false;
      let stderrWrites = 0;
      const exitCode = runCli(['unknown-command'], createOutput({
        stdout: {
          write() {}
        },
        stderr: {
          write() {
            stderrWrites += 1;

            if (stderrWrites === 1) {
              return new Promise<void>((resolve) => {
                finishWrite = resolve;
              });
            }

            return undefined;
          }
        }
      })).then((code) => {
        commandFinished = true;

        return code;
      });

      await Promise.resolve();

      assert.equal(commandFinished, false);
      assert.equal(stderrWrites, 1);

      if (finishWrite === undefined) {
        throw new Error('Expected stderr write to start');
      }

      finishWrite();

      assert.equal(await exitCode, 2);
      assert.equal(commandFinished, true);
      assert.equal(stderrWrites, 1);
    });

    test('does not resolve legacy shortcut commands', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['portfolio'], io);

      assert.equal(exitCode, 2);
      assert.equal(read().stdout, '');
      assert.match(read().stderr, /Unknown command: portfolio/);
      assert.match(read().stderr, /Usage:/);
    });
  });
});
