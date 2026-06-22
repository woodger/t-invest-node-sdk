import assert from 'node:assert';
import { describe, test } from 'node:test';
import { createStdoutWriter } from './stdout-writer';

describe('createStdoutWriter', () => {
  test('writes text to the provided stdout sink', () => {
    let output = '';
    const writer = createStdoutWriter({
      write(chunk: string) {
        output += chunk;
      }
    });

    writer.write('hello\n');

    assert.equal(output, 'hello\n');
  });
});
