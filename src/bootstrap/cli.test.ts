import assert from 'node:assert';
import { describe, test } from 'node:test';
import { parseCliArgs, runCli } from './cli';

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

describe('bootstrap cli', () => {
  describe('parseCliArgs', () => {
    test('maps help and version flag aliases', () => {
      assert.deepEqual(
        parseCliArgs(['version', '--help', '-v']),
        {
          _: ['version'],
          help: true,
          v: true
        }
      );
    });

    test('maps long options with values and boolean flags', () => {
      assert.deepEqual(
        parseCliArgs([
          'accounts',
          '--format',
          'json',
          '--token=secret',
          '--endpoint=invest.example:443',
          '--insecure'
        ]),
        {
          _: ['accounts'],
          format: 'json',
          token: 'secret',
          endpoint: 'invest.example:443',
          insecure: true
        }
      );
    });

    test('does not consume values after known boolean flags', () => {
      assert.deepEqual(
        parseCliArgs(['--help', 'accounts', '--version', 'candles']),
        {
          _: ['accounts', 'candles'],
          help: true,
          version: true
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
      const exitCode = await runCli(['version', '--help'], io);

      assert.equal(exitCode, 0);
      assert.match(read().stdout, /version - Show package and runtime version info/);
      assert.match(read().stdout, /tinkoff-invest-node-sdk --version/);
      assert.equal(read().stderr, '');
    });

    test('prints command-specific help from help command argument', async () => {
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
      const exitCode = await runCli(['orders'], io);

      assert.equal(exitCode, 1);
      assert.equal(read().stdout, '');
      assert.match(read().stderr, /Unknown command: orders/);
      assert.match(read().stderr, /Usage:/);
    });
  });
});
