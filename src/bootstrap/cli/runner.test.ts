import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import { createOutput } from 'icore';
import packageJson from '../../../package.json';
import { maxInt32 } from '../args/command-options';
import { cliExitCodes, terminalErrorPolicy } from './error';
import { renderCliHelp, renderCommandHelp, renderDomainHelp } from './help';
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
        parseCliInput([
          '--help',
          'users',
          'get-accounts',
          '--version',
          'marketdata',
          'get-candles'
        ]),
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
      for (
        const [argument, replacement] of [
          ['--h', /use '--help' or '-h'/],
          ['--no-h', /use '--help' or '-h'/],
          ['--v', /use '--version' or '-v'/],
          ['--no-v', /use '--version' or '-v'/]
        ] as const
      ) {
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

      assert.equal(exitCode, cliExitCodes.success);
      assert.match(read().stdout, /Usage:/);
      assert.equal(read().stderr, '');
    });

    test('rejects unsupported options in global shortcut paths', async () => {
      for (
        const argv of [
          ['--unknown-option'],
          ['--format=json'],
          ['--version', '--unknown-option']
        ] as const
      ) {
        const { io, read } = createIo();
        const exitCode = await runCli(argv, io);

        assert.equal(exitCode, cliExitCodes.usageError);
        assert.equal(read().stdout, '');
        assert.match(
          read().stderr,
          /Unexpected option '--(?:unknown-option|format)'/
        );
      }
    });

    // Содержание страниц проверяется в help.test.ts; здесь важен выбор страницы по argv.
    test('routes help requests to the expected page', async () => {
      for (const [argv, stdout] of [
        [['--help'], renderCliHelp()],
        [['-h'], renderCliHelp()],
        [['help'], renderCliHelp()],
        [['operation', 'portfolio', '--help'], renderCommandHelp('operation portfolio')],
        [['sandbox', 'get-sandbox-accounts', '--help'], renderCommandHelp('sandbox account list')],
        [['operations', 'get-portfolio', '--help'], renderCommandHelp('operation portfolio')],
        [['account', '--help'], renderDomainHelp('account')],
        [['help', 'market', 'get-candles'], renderCommandHelp('market candles')],
        [['help', 'version'], renderCommandHelp('version')],
        [['help', 'compile-proto'], renderCommandHelp('dev compile-proto')]
      ] as const) {
        const { io, read } = createIo();
        const exitCode = await runCli(argv, io);

        assert.equal(exitCode, cliExitCodes.success);
        assert.deepEqual(read(), { stdout, stderr: '' });
      }
    });

    test('prints help without validating command-specific options', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli([
        'operation',
        'portfolio',
        '--help',
        '--format=xml'
      ], io);

      assert.equal(exitCode, cliExitCodes.success);
      assert.match(read().stdout, /operation portfolio - Print account portfolio/);
      assert.equal(read().stderr, '');
    });

    test('keeps help targets after the option terminator as literal text', async () => {
      for (const target of ['--version', '-v', '--help', '--format=json', '--']) {
        const { io, read } = createIo();
        const exitCode = await runCli(['--help', '--', target], io);

        assert.equal(exitCode, cliExitCodes.success);
        assert.match(read().stdout, /Usage:/);
        assert.equal(read().stderr, '');
      }
    });

    test('prints version from version command and global flag', async () => {
      for (const command of ['version', '--version', '-v']) {
        const { io, read } = createIo();
        const exitCode = await runCli([command], io);

        assert.equal(exitCode, cliExitCodes.success);
        assert.equal(
          read().stdout,
          `t-invest-node-sdk ${packageJson.version}\n`
        );
        assert.equal(read().stderr, '');
      }
    });

    test('rejects extra positionals for version command', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['version', 'unexpected'], io);

      assert.equal(exitCode, cliExitCodes.usageError);
      assert.equal(read().stdout, '');
      assert.match(
        read().stderr,
        /Unexpected positional argument for 'version': unexpected/
      );
    });

    test(
      'returns a usage failure for undocumented long forms of short aliases',
      async () => {
        for (
          const [argument, replacement] of [
            ['--h', /use '--help' or '-h'/],
            ['--v', /use '--version' or '-v'/]
          ] as const
        ) {
          const { io, read } = createIo();
          const exitCode = await runCli([argument], io);

          assert.equal(exitCode, cliExitCodes.usageError);
          assert.equal(read().stdout, '');
          assert.match(read().stderr, replacement);
        }
      }
    );

    test(
      'returns a failure for assigned global boolean flag values',
      async () => {
        const { io, read } = createIo();
        const exitCode = await runCli(['--help=false'], io);

        assert.equal(exitCode, cliExitCodes.usageError);
        assert.equal(read().stdout, '');
        assert.match(read().stderr, /Expected '--help' as boolean flag/);
      }
    );

    test(
      'reports bootstrap output failures with the write phase',
      async (context) => {
        const failure = new Error('stdout failed');
        const originalRenderError = terminalErrorPolicy.renderError;

        assert.ok(originalRenderError);

        const renderError = context.mock.fn(originalRenderError);

        context.after(() => {
          terminalErrorPolicy.renderError = originalRenderError;
        });
        terminalErrorPolicy.renderError = renderError;

        let stderr = '';
        const exitCode = await runCli(
          ['--version'],
          createOutput({
            stdout: {
              write() {
                throw failure;
              }
            },
            stderr: {
              write(chunk: string) {
                stderr += chunk;
              }
            }
          })
        );

        assert.equal(exitCode, cliExitCodes.runtimeError);
        assert.equal(stderr, 'stdout failed\n');
        assert.equal(renderError.mock.callCount(), 1);
        assert.equal(renderError.mock.calls[0]?.arguments[0], failure);
        assert.equal(renderError.mock.calls[0]?.arguments[1].phase, 'write');
      }
    );

    test(
      'keeps legacy command paths executable through the runner',
      async () => {
        const { io, read } = createIo();
        const exitCode = await runCli(
          ['users', 'get-accounts', '--format=xml'],
          io
        );

        assert.equal(exitCode, cliExitCodes.usageError);
        assert.equal(read().stdout, '');
        assert.match(
          read().stderr,
          /Expected '--format' as one of: json, table/
        );
      }
    );

    for (
      const { args, option } of [
        {
          args: [
            'market',
            'order-book',
            '--instrument-id=instrument-id',
            '--depth=2147483648'
          ],
          option: 'depth'
        },
        {
          args: [
            'operation',
            'broker-report',
            '--task-id=task-id',
            '--page=2147483648'
          ],
          option: 'page'
        },
        {
          args: [
            'operation',
            'foreign-dividends-report',
            '--task-id=task-id',
            '--page=2147483648'
          ],
          option: 'page'
        }
      ]
    ) {
      test(`returns a usage failure for int32 overflow in ${args.slice(0, 2).join(' ')}`, async () => {
        const { io, read } = createIo();
        const exitCode = await runCli([
          ...args,
          '--token=token',
          '--endpoint=127.0.0.1:1',
          '--insecure'
        ], io);

        assert.equal(exitCode, cliExitCodes.usageError);
        assert.equal(read().stdout, '');
        assert.match(
          read().stderr,
          new RegExp(
            `Expected '--${option}' to be less than or equal to ${maxInt32}`
          )
        );
      });
    }

    test('rejects extra command positionals during prepare', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['account', 'list', 'unexpected'], io);

      assert.equal(exitCode, cliExitCodes.usageError);
      assert.equal(read().stdout, '');
      assert.match(
        read().stderr,
        /Unexpected positional argument for 'account list': unexpected/
      );
    });

    test('waits for async stdout writes', async () => {
      let finishWrite: (() => void) | undefined;
      let notifyWriteStarted: (() => void) | undefined;
      const writeStarted = new Promise<void>((resolve) => {
        notifyWriteStarted = resolve;
      });
      let commandFinished = false;
      const exitCode = runCli(
        ['version'],
        createOutput({
          stdout: {
            write() {
              notifyWriteStarted?.();

              return new Promise<void>((resolve) => {
                finishWrite = resolve;
              });
            }
          },
          stderr: {
            // Этот сценарий не проверяет вывод в stderr.
            // oxlint-disable-next-line no-empty-function
            write() {}
          }
        })
      ).then((code) => {
        commandFinished = true;

        return code;
      });

      await writeStarted;

      assert.equal(commandFinished, false);

      if (finishWrite === undefined) {
        throw new Error('Expected stdout write to start');
      }

      finishWrite();

      assert.equal(await exitCode, cliExitCodes.success);
      assert.equal(commandFinished, true);
    });

    test('returns a failure for unknown commands', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['unknown-command'], io);

      assert.equal(exitCode, cliExitCodes.usageError);
      assert.equal(read().stdout, '');
      assert.match(read().stderr, /Unknown command: unknown-command/);
      assert.match(read().stderr, /Usage:/);
    });

    test('prints deprecated figi option warnings to stderr', async () => {
      for (const optionArgs of [['--figi=FUTFIGI'], ['--figi', 'FUTFIGI']]) {
        const { io, read } = createIo();
        const exitCode = await runCli([
          'instrument',
          'get-futures-margin',
          ...optionArgs
        ], io);

        assert.equal(exitCode, cliExitCodes.usageError);
        assert.equal(read().stdout, '');
        assert.match(read().stderr, /Warning: '--figi' is deprecated/);
        assert.match(read().stderr, /use '--instrument-id' instead/);
        assert.match(read().stderr, /Expected '--token' or T_INVEST_TOKEN/);
      }
    });

    test('does not warn for canonical instrument-id option', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli([
        'instrument',
        'get-futures-margin',
        '--instrument-id=FUTFIGI'
      ], io);

      assert.equal(exitCode, cliExitCodes.usageError);
      assert.equal(read().stdout, '');
      assert.doesNotMatch(read().stderr, /deprecated/);
      assert.match(read().stderr, /Expected '--token' or T_INVEST_TOKEN/);
    });

    test('waits for async stderr writes', async () => {
      let finishWrite: (() => void) | undefined;
      let notifyWriteStarted: (() => void) | undefined;
      const writeStarted = new Promise<void>((resolve) => {
        notifyWriteStarted = resolve;
      });
      let commandFinished = false;
      let stderrWrites = 0;
      const exitCode = runCli(
        ['unknown-command'],
        createOutput({
          stdout: {
            // Этот сценарий не проверяет вывод в stdout.
            // oxlint-disable-next-line no-empty-function
            write() {}
          },
          stderr: {
            write() {
              stderrWrites += 1;

              if (stderrWrites === 1) {
                notifyWriteStarted?.();

                return new Promise<void>((resolve) => {
                  finishWrite = resolve;
                });
              }

              return undefined;
            }
          }
        })
      ).then((code) => {
        commandFinished = true;

        return code;
      });

      await writeStarted;

      assert.equal(commandFinished, false);
      assert.equal(stderrWrites, 1);

      if (finishWrite === undefined) {
        throw new Error('Expected stderr write to start');
      }

      finishWrite();

      assert.equal(await exitCode, cliExitCodes.usageError);
      assert.equal(commandFinished, true);
      assert.equal(stderrWrites, 1);
    });

    test('does not resolve legacy shortcut commands', async () => {
      const { io, read } = createIo();
      const exitCode = await runCli(['portfolio'], io);

      assert.equal(exitCode, cliExitCodes.usageError);
      assert.equal(read().stdout, '');
      assert.match(read().stderr, /Unknown command: portfolio/);
      assert.match(read().stderr, /Usage:/);
    });
  });
});
