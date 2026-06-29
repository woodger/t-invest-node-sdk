import assert from 'node:assert';
import { describe, test } from 'node:test';
import { createStderrWriter } from './stderr-writer';

describe('createStderrWriter', () => {
  test('writes text to the provided stderr sink', async () => {
    let output = '';
    const writer = createStderrWriter({
      write(chunk: string) {
        output += chunk;
      }
    });

    await writer.write('error\n');

    assert.equal(output, 'error\n');
  });

  test('waits for drain when stderr reports backpressure', async () => {
    let drainListener: (() => void) | undefined;
    let writeSettled = false;
    const events: string[] = [];
    const writer = createStderrWriter({
      write(chunk: string) {
        events.push(`write:${chunk}`);

        return false;
      },
      once(event: 'drain', listener: () => void) {
        events.push(event);
        drainListener = listener;
      }
    });

    const write = Promise.resolve(writer.write('error\n')).then(() => {
      writeSettled = true;
    });

    await Promise.resolve();

    assert.equal(writeSettled, false);
    assert.deepEqual(events, [
      'write:error\n',
      'drain'
    ]);

    drainListener?.();
    await write;

    assert.equal(writeSettled, true);
  });
});
