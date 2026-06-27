import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { CliArgs } from './cli-contract';
import {
  parseCommaSeparatedStringListOption,
  parseCommandOptions,
  parseDateTimeOption,
  parseOptionalNonNegativeIntegerOption,
  parseRequiredDateTimeOption,
  requireStringOption,
  withSdkOptions
} from './command-mechanics';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['users get-accounts'],
    ...args
  };
}

describe('command mechanics', () => {
  describe('withSdkOptions', () => {
    test('allows common SDK options with command-specific options', () => {
      const options = parseCommandOptions(
        argv({
          token: 'token',
          endpoint: 'localhost:50051',
          format: 'json'
        }),
        'users get-accounts',
        withSdkOptions({
          format: {
            type: 'string',
            choices: ['json', 'table'],
            default: 'table'
          }
        } as const)
      );

      assert.deepEqual(options, {
        token: 'token',
        endpoint: 'localhost:50051',
        'app-name': undefined,
        insecure: undefined,
        format: 'json'
      });
    });
  });

  describe('parseCommandOptions', () => {
    test('rejects unexpected named options', () => {
      assert.throws(
        () => parseCommandOptions(
          argv({ unexpected: 'value' }),
          'users get-accounts',
          withSdkOptions({})
        ),
        /Unexpected argument '--unexpected'/
      );
    });

    test('rejects extra positionals', () => {
      assert.throws(
        () => parseCommandOptions(
          argv({ _: ['users get-accounts', 'extra'] }),
          'users get-accounts',
          withSdkOptions({})
        ),
        /Unexpected positional argument for 'users get-accounts': extra/
      );
    });

    test('rejects non-scalar option values from legacy CliArgs', () => {
      assert.throws(
        () => parseCommandOptions(
          argv({ token: ['token'] }),
          'users get-accounts',
          withSdkOptions({})
        ),
        /Expected '--token' as scalar option/
      );
    });
  });

  describe('parseCommaSeparatedStringListOption', () => {
    test('returns trimmed comma-separated values', () => {
      assert.deepEqual(
        parseCommaSeparatedStringListOption('first, second', 'instrument-id'),
        ['first', 'second']
      );
    });

    test('rejects empty comma-separated values', () => {
      assert.throws(
        () => parseCommaSeparatedStringListOption('first,,second', 'instrument-id'),
        /Expected '--instrument-id' as comma-separated list/
      );
    });
  });

  describe('parseDateTimeOption', () => {
    test('returns parsed date-time', () => {
      assert.deepEqual(
        parseDateTimeOption('2026-01-01T00:00:00Z', 'from'),
        new Date('2026-01-01T00:00:00Z')
      );
    });

    test('rejects invalid date-time values', () => {
      assert.throws(
        () => parseDateTimeOption('not-a-date', 'from'),
        /Expected '--from' as date-time/
      );
    });
  });

  describe('requireStringOption', () => {
    test('returns present string option', () => {
      assert.equal(requireStringOption('value', 'name'), 'value');
    });

    test('rejects absent string option', () => {
      assert.throws(
        () => requireStringOption(undefined, 'name'),
        /Expected required argument '--name'/
      );
    });
  });

  describe('parseRequiredDateTimeOption', () => {
    test('returns parsed required date-time', () => {
      assert.deepEqual(
        parseRequiredDateTimeOption('2026-01-01T00:00:00Z', 'from'),
        new Date('2026-01-01T00:00:00Z')
      );
    });

    test('rejects absent date-time option', () => {
      assert.throws(
        () => parseRequiredDateTimeOption(undefined, 'from'),
        /Expected required argument '--from'/
      );
    });
  });

  describe('parseOptionalNonNegativeIntegerOption', () => {
    test('returns zero when option is absent', () => {
      assert.equal(parseOptionalNonNegativeIntegerOption(undefined, 'page'), 0);
    });

    test('returns parsed non-negative integer', () => {
      assert.equal(parseOptionalNonNegativeIntegerOption('2', 'page'), 2);
    });

    test('rejects negative integer values', () => {
      assert.throws(
        () => parseOptionalNonNegativeIntegerOption('-1', 'page'),
        /Expected '--page' as integer greater than or equal to 0/
      );
    });
  });
});
