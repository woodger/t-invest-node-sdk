import assert from 'node:assert';
import { describe, test } from 'node:test';
import { renderCsvRow } from './csv-renderer';

describe('renderCsvRow', () => {
  test('escapes comma, quote and newline values', () => {
    const output = renderCsvRow([
      'plain',
      'with,comma',
      'with "quote"',
      'line\nbreak',
      42,
      true
    ]);

    assert.equal(output, 'plain,"with,comma","with ""quote""","line\nbreak",42,true');
  });
});
