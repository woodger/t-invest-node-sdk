import assert from 'node:assert';
import { describe, test } from 'node:test';
import { renderCommandError } from './error';

describe('renderCommandError', () => {
  test('renders Error message with trailing newline', () => {
    assert.equal(renderCommandError(new Error('failed')), 'failed\n');
  });

  test('renders unknown thrown value with trailing newline', () => {
    assert.equal(renderCommandError('failed'), 'failed\n');
  });
});
