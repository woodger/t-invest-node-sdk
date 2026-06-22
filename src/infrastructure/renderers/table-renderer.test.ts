import assert from 'node:assert';
import { describe, test } from 'node:test';
import { renderTextTable } from './table-renderer';

describe('renderTextTable', () => {
  test('aligns columns and keeps the trailing newline used by CLI output', () => {
    const output = renderTextTable([
      ['id', 'name'],
      ['1', 'Long name'],
      ['100', 'A']
    ]);

    assert.equal(output, [
      'id   name',
      '1    Long name',
      '100  A',
      ''
    ].join('\n'));
  });
});
