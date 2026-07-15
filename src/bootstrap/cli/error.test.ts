import assert from 'node:assert';
import { describe, test } from 'node:test';
import { IcoreError } from 'icore';
import { renderCommandError, resolveCommandExitCode } from './error';

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
  test('preserves exit code one for terminal errors', () => {
    assert.equal(resolveCommandExitCode(), 1);
  });
});
