import assert from 'node:assert';
import { describe, test } from 'node:test';
import { IcoreError } from 'icore';
import { renderCommandError, resolveCommandExitCode } from './error';
import { CliUsageError } from './usage-error';

describe('renderCommandError', () => {
  test('renders Error message with trailing newline', () => {
    assert.equal(renderCommandError(new Error('failed')), 'failed\n');
  });

  test('renders unknown thrown value with trailing newline', () => {
    assert.equal(renderCommandError('failed'), 'failed\n');
  });

  test('renders unresolved command details with top-level help', () => {
    const output = renderCommandError(new IcoreError(
      'UNKNOWN_COMMAND',
      'Unknown command: unknown-command',
      {
        reason: 'unresolved',
        command: 'unknown-command',
        positionals: ['unknown-command']
      }
    ));

    assert.match(output, /^Unknown command: unknown-command\n\n/);
    assert.match(output, /Usage:/);
  });

  test('renders path-mismatch command details with top-level help', () => {
    const output = renderCommandError(new IcoreError(
      'UNKNOWN_COMMAND',
      "Expected command 'account list'",
      {
        reason: 'path-mismatch',
        command: 'account list',
        path: ['account', 'list'],
        positionals: ['account', 'unknown']
      }
    ));

    assert.match(output, /^Unknown command: account unknown\n\n/);
    assert.match(output, /Usage:/);
  });
});

describe('resolveCommandExitCode', () => {
  test('returns exit code two for icore usage errors', () => {
    const error = new IcoreError(
      'UNEXPECTED_POSITIONAL',
      "Unexpected positional 'extra'",
      {
        command: 'account list',
        positional: 'extra',
        positionals: ['extra']
      }
    );

    assert.equal(resolveCommandExitCode(error), 2);
  });

  test('returns exit code two for project usage errors', () => {
    assert.equal(resolveCommandExitCode(new CliUsageError('Invalid input')), 2);
  });

  test('returns exit code one for icore definition errors', () => {
    const error = new IcoreError(
      'INVALID_OPTION_ALIAS',
      "Invalid alias for '--format'",
      {
        argument: '--format',
        option: 'format',
        alias: false
      }
    );

    assert.equal(resolveCommandExitCode(error), 1);
  });

  test('returns exit code one for runtime errors', () => {
    assert.equal(resolveCommandExitCode(new Error('failed')), 1);
  });
});
