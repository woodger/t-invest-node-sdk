import assert from 'node:assert';
import { describe, test } from 'node:test';
import { renderJson } from './json-renderer';

describe('renderJson', () => {
  test('renders pretty JSON with the trailing newline used by CLI output', () => {
    const output = renderJson([
      {
        id: 'account-1',
        name: 'Brokerage account'
      }
    ]);

    assert.equal(output, [
      '[',
      '  {',
      '    "id": "account-1",',
      '    "name": "Brokerage account"',
      '  }',
      ']',
      ''
    ].join('\n'));
  });
});
