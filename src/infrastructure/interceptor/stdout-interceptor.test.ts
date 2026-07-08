import { describe, test } from 'node:test';
import assert from 'node:assert';
import { stdoutInterceptor } from './stdout-interceptor';

describe('stdoutInterceptor', () => {
  test('captures and suppresses matching output', () => {
    const handle = stdoutInterceptor({
      rules: [{ messageIncludes: 'IGNORE_ME' }]
    });

    try {
      process.stdout.write('Hello IGNORE_ME\n');

      assert.match(handle.getOutput(), /IGNORE_ME/);
    }
    finally {
      handle.restore();
    }
  });

  test('restores original stdout writer', () => {
    const originalWrite = process.stdout.write;
    const handle = stdoutInterceptor({
      rules: [{ messageIncludes: 'IGNORE_ME' }]
    });

    handle.restore();

    assert.strictEqual(process.stdout.write, originalWrite);
  });

  test('passes through non-matching output', () => {
    const originalWrite = process.stdout.write;
    const passedThrough: string[] = [];

    process.stdout.write = ((chunk: unknown) => {
      passedThrough.push(String(chunk));
      return true;
    }) as typeof process.stdout.write;

    const handle = stdoutInterceptor({
      rules: [{ messageIncludes: 'IGNORE_ME' }]
    });

    try {
      process.stdout.write('plain output\n');

      assert.match(handle.getOutput(), /plain output/);
      assert.deepStrictEqual(passedThrough, ['plain output\n']);
    } finally {
      handle.restore();
      process.stdout.write = originalWrite;
    }
  });
});
