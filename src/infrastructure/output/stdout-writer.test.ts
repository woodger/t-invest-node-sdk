import assert from 'node:assert';
import { describe, test } from 'node:test';
import { createStdoutWriter } from './stdout-writer';

describe('createStdoutWriter', () => {
  test('writes text to the provided stdout sink', async () => {
    let output = '';
    const writer = createStdoutWriter({
      write(chunk: string) {
        output += chunk;
      }
    });

    await writer.write('hello\n');

    assert.equal(output, 'hello\n');
  });

  test('waits for drain when stdout reports backpressure', async () => {
    let drainListener: (() => void) | undefined;
    let writeSettled = false;
    const events: string[] = [];
    const writer = createStdoutWriter({
      write(chunk: string) {
        events.push(`write:${chunk}`);

        return false;
      },
      once(event: 'drain', listener: () => void) {
        events.push(event);
        drainListener = listener;
      }
    });

    const write = Promise.resolve(writer.write('hello\n')).then(() => {
      writeSettled = true;
    });

    await Promise.resolve();

    assert.equal(writeSettled, false);
    assert.deepEqual(events, [
      'write:hello\n',
      'drain'
    ]);

    drainListener?.();
    await write;

    assert.equal(writeSettled, true);
  });
});
