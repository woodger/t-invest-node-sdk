import assert from 'node:assert';
import { describe, test } from 'node:test';
import { parseCliInput, runCli } from './cli-runner';

function createIo() {
  let stdout = '';
  let stderr = '';

  return {
    io: {
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
    },
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
            v: true
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
        assert.match(read().stdout, /Commands:/);
        assert.equal(read().stderr, '');
      }
    });

    test('prints command-specific help from a command help flag', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['operations', 'get-portfolio', '--help'], io);

      assert.equal(exitCode, 0);
      assert.match(read().stdout, /operations get-portfolio - Print account portfolio/);
      assert.match(read().stdout, /SDK call:\n {2}sdk\.operations\.getPortfolio/);
      assert.match(read().stdout, /tinkoff-invest-node-sdk operations get-portfolio --account-id=ID/);
      assert.equal(read().stderr, '');
    });

    test('prints command-specific help from help command argument', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['help', 'marketdata', 'get-candles'], io);

      assert.equal(exitCode, 0);
      assert.match(read().stdout, /marketdata get-candles - Print historical candles/);
      assert.match(read().stdout, /gRPC method:\n {2}MarketDataService\/GetCandles/);
      assert.equal(read().stderr, '');
    });

    test('prints utility help from help command argument', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['help', 'version'], io);

      assert.equal(exitCode, 0);
      assert.match(read().stdout, /version - Show package and runtime version info/);
      assert.match(read().stdout, /tinkoff-invest-node-sdk --version/);
      assert.equal(read().stderr, '');
    });

    test('prints version from version command and global flag', async () => {
      for (const command of ['version', '--version']) {
        const { io, read } = createIo();
        const exitCode = await runCli([command], io);

        assert.equal(exitCode, 0);
        assert.match(read().stdout, /^tinkoff-invest-node-sdk \d+\.\d+\.\d+/);
        assert.match(read().stdout, /node v\d+/);
        assert.equal(read().stderr, '');
      }
    });

    test('returns a failure for unknown commands', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['unknown-command'], io);

      assert.equal(exitCode, 1);
      assert.equal(read().stdout, '');
      assert.match(read().stderr, /Unknown command: unknown-command/);
      assert.match(read().stderr, /Usage:/);
    });

    test('does not resolve legacy shortcut commands', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['portfolio'], io);

      assert.equal(exitCode, 1);
      assert.equal(read().stdout, '');
      assert.match(read().stderr, /Unknown command: portfolio/);
      assert.match(read().stderr, /Usage:/);
    });
  });
});
