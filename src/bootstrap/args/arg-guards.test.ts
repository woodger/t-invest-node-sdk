import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { CliArgs } from '../cli-contract';
import { ArgGuards } from './arg-guards';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: [],
    ...args
  };
}

describe('ArgGuards', () => {
  describe('requireStringArg', () => {
    test('returns non-empty string argument', () => {
      assert.equal(
        ArgGuards.requireStringArg(argv({ token: 'secret' }), 'token'),
        'secret'
      );
    });

    test('throws when required string argument is absent or blank', () => {
      assert.throws(
        () => ArgGuards.requireStringArg(argv(), 'token'),
        /Expected required argument '--token'/
      );
      assert.throws(
        () => ArgGuards.requireStringArg(argv({ token: '   ' }), 'token'),
        /Expected required argument '--token'/
      );
    });
  });

  describe('optionalStringArgValue', () => {
    test('returns undefined when argument is absent', () => {
      assert.equal(
        ArgGuards.optionalStringArgValue(argv(), 'app-name'),
        undefined
      );
    });

    test('rejects boolean flag form', () => {
      assert.throws(
        () => ArgGuards.optionalStringArgValue(argv({ token: true }), 'token'),
        /Expected '--token' as string/
      );
    });
  });

  describe('optionalBooleanFlagArg', () => {
    test('returns true only for boolean flag form', () => {
      assert.equal(
        ArgGuards.optionalBooleanFlagArg(argv({ insecure: true }), 'insecure'),
        true
      );
      assert.equal(
        ArgGuards.optionalBooleanFlagArg(argv(), 'insecure'),
        undefined
      );
    });

    test('rejects explicit boolean flag values', () => {
      assert.throws(
        () => ArgGuards.optionalBooleanFlagArg(argv({ insecure: 'true' }), 'insecure'),
        /Expected '--insecure' as boolean flag/
      );
    });
  });

  describe('optionalEnumArgValue', () => {
    test('returns whitelisted enum values', () => {
      assert.equal(
        ArgGuards.optionalEnumArgValue(argv({ format: 'json' }), 'format', ['json', 'table']),
        'json'
      );
    });

    test('throws for unknown enum values', () => {
      assert.throws(
        () => ArgGuards.optionalEnumArgValue(argv({ format: 'xml' }), 'format', ['json', 'table']),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('parseDateArg', () => {
    test('returns parsed date', () => {
      const date = ArgGuards.parseDateArg(
        argv({ from: '2026-06-19T00:00:00.000Z' }),
        'from'
      );

      assert.equal(date.toISOString(), '2026-06-19T00:00:00.000Z');
    });

    test('throws when date argument is invalid', () => {
      assert.throws(
        () => ArgGuards.parseDateArg(argv({ from: 'not-a-date' }), 'from'),
        /Expected '--from' as date-time/
      );
    });
  });

  describe('assertKnownArgs', () => {
    test('ignores positional arguments and accepts known options', () => {
      assert.doesNotThrow(() => {
        ArgGuards.assertKnownArgs(
          argv({
            _: ['accounts'],
            token: 'secret'
          }),
          new Set(['token'])
        );
      });
    });

    test('throws for unexpected named options', () => {
      assert.throws(
        () => ArgGuards.assertKnownArgs(argv({ unexpected: true }), new Set()),
        /Unexpected argument '--unexpected'/
      );
    });
  });
});
