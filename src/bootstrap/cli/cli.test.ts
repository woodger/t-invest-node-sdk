import assert from 'node:assert';
import { describe, test } from 'node:test';
import { renderCliHelp } from '../help';
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
  });

  describe('runCli', () => {
    test('prints help when no command is provided', () => {
      const { io, read } = createIo();
      const exitCode = runCli([], io);

      assert.equal(exitCode, 0);
      assert.match(read().stdout, /Usage:/);
      assert.equal(read().stderr, '');
    });

    test('prints top-level help from help command and global flags', () => {
      for (const command of ['--help', '-h', 'help']) {
        const { io, read } = createIo();
        const exitCode = runCli([command], io);

        assert.equal(exitCode, 0);
        assert.match(read().stdout, /Commands:/);
        assert.equal(read().stderr, '');
      }
    });

    test('prints command-specific help from a command help flag', () => {
      const { io, read } = createIo();
      const exitCode = runCli(['version', '--help'], io);

      assert.equal(exitCode, 0);
      assert.match(read().stdout, /version - Show package and runtime version info/);
      assert.match(read().stdout, /tinkoff-invest-node-sdk --version/);
      assert.equal(read().stderr, '');
    });

    test('prints version from version command and global flag', () => {
      for (const command of ['version', '--version']) {
        const { io, read } = createIo();
        const exitCode = runCli([command], io);

        assert.equal(exitCode, 0);
        assert.match(read().stdout, /^tinkoff-invest-node-sdk \d+\.\d+\.\d+/);
        assert.match(read().stdout, /node v\d+/);
        assert.equal(read().stderr, '');
      }
    });

    test('returns a failure for unknown commands', () => {
      const { io, read } = createIo();
      const exitCode = runCli(['accounts'], io);

      assert.equal(exitCode, 1);
      assert.equal(read().stdout, '');
      assert.match(read().stderr, /Unknown command: accounts/);
      assert.match(read().stderr, /Usage:/);
    });
  });

  describe('renderCliHelp', () => {
    test('renders top-level help', () => {
      const help = renderCliHelp();

      assert.match(help, /Usage:/);
      assert.match(help, /Global options:/);
      assert.match(help, /Commands:/);
      assert.match(help, /tinkoff-invest-node-sdk --help/);
      assert.doesNotMatch(help, /Examples:/);
    });
  });
});
