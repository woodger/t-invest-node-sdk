import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { warningInterceptor } from './warning-interceptor';

describe('warningInterceptor', () => {
  let originalEmitWarning: typeof process.emitWarning;
  let calls: Array<{
    warning: string | Error;
    args: unknown[];
  }>;

  beforeEach(() => {
    calls = [];
    originalEmitWarning = process.emitWarning;

    process.emitWarning = ((warning: string | Error, ...args: unknown[]) => {
      calls.push({ warning, args });
    }) as typeof process.emitWarning;
  });

  afterEach(() => {
    process.emitWarning = originalEmitWarning;
  });

  test('suppresses warning when message matches rule', () => {
    warningInterceptor({
      rules: [{ messageIncludes: 'IGNORE_ME' }],
      enabled: true
    });

    process.emitWarning('This should IGNORE_ME completely');

    assert.strictEqual(calls.length, 0);
  });

  test('passes warning through when message does not match rule', () => {
    warningInterceptor({
      rules: [{ messageIncludes: 'IGNORE_ME' }],
      enabled: true
    });

    process.emitWarning('This is important');

    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls.at(0)?.warning, 'This is important');
  });

  test('suppresses Error warning when message matches rule', () => {
    warningInterceptor({
      rules: [{ messageIncludes: 'IGNORE_ME' }],
      enabled: true
    });

    process.emitWarning(new Error('Something IGNORE_ME happened'));

    assert.strictEqual(calls.length, 0);
  });

  test('passes warning through when interceptor is disabled', () => {
    const restore = warningInterceptor({
      rules: [{ messageIncludes: 'IGNORE_ME' }],
      enabled: false
    });

    process.emitWarning('IGNORE_ME');

    assert.strictEqual(calls.length, 1);
    assert.ok(typeof restore === 'function');
  });

  test('suppresses warning when at least one rule matches', () => {
    warningInterceptor({
      rules: [
        { messageIncludes: 'FOO' },
        { messageIncludes: 'BAR' }
      ],
      enabled: true
    });

    process.emitWarning('Something BAR happened');

    assert.strictEqual(calls.length, 0);
  });

  test('restores original emitWarning handler when restore is called', () => {
    const restore = warningInterceptor({
      rules: [{ messageIncludes: 'IGNORE_ME' }],
      enabled: true
    });

    restore();
    process.emitWarning('IGNORE_ME');

    assert.strictEqual(calls.length, 1);
  });
});
