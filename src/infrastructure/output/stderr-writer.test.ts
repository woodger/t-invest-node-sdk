import assert from 'node:assert';
import { describe, test } from 'node:test';
import { createStderrWriter } from './stderr-writer';

describe('createStderrWriter', () => {
  test('writes text to the provided stderr sink', () => {
    let output = '';
    const writer = createStderrWriter({
      write(chunk: string) {
        output += chunk;
      }
    });

    writer.write('error\n');

    assert.equal(output, 'error\n');
  });
});
