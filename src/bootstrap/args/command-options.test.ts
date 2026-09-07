import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { CommandRawOptions } from './command-options';
import {
  parseCommaSeparatedStringListOption,
  parseCommandOptions,
  parseDateTimeOption,
  parseOptionalNonNegativeIntegerOption,
  parseRequiredDateTimeOption,
  positiveSafeIntegerOption,
  requireStringOption,
  withSdkOptions
} from './command-options';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

describe('command options', () => {
  describe('withSdkOptions', () => {
    test('allows common SDK options with command-specific options', () => {
      const options = parseCommandOptions(
        rawOptions({
          token: 'token',
          endpoint: 'localhost:50051',
          format: 'json',
          cursor: 'next'
        }),
        withSdkOptions(
          {
            format: {
              type: 'string',
              choices: ['json', 'table'],
              default: 'table'
            }
          } as const,
          {
            cursor: {
              type: 'string'
            }
          }
        )
      );

      assert.deepEqual(options, {
        token: 'token',
        endpoint: 'localhost:50051',
        'app-name': undefined,
        insecure: undefined,
        format: 'json',
        cursor: 'next'
      });
    });
  });

  describe('parseCommandOptions', () => {
    test('rejects unexpected named options', () => {
      assert.throws(
        () => parseCommandOptions(
          rawOptions({ unexpected: 'value' }),
          withSdkOptions({})
        ),
        /Unexpected argument '--unexpected'/
      );
    });

    test('rejects non-scalar raw option values', () => {
      assert.throws(
        () => parseCommandOptions(
          rawOptions({ token: ['token'] }),
          withSdkOptions({})
        ),
        /Expected '--token' as scalar option/
      );
    });

    test('rejects text values for boolean options', () => {
      assert.throws(
        () => parseCommandOptions(
          rawOptions({ insecure: 'false' }),
          withSdkOptions({})
        ),
        /Expected '--insecure' as boolean flag/
      );
    });

    test('rejects positive integers outside the safe number range', () => {
      assert.throws(
        () => parseCommandOptions(
          rawOptions({ quantity: '9007199254740993' }),
          { quantity: positiveSafeIntegerOption }
        ),
        /Expected '--quantity' to be less than or equal to 9007199254740991/
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

    test('returns date-time with an explicit numeric offset', () => {
      assert.deepEqual(
        parseDateTimeOption('2026-01-01T03:00:00+03:00', 'from'),
        new Date('2026-01-01T00:00:00Z')
      );
    });

    test('rejects invalid date-time values', () => {
      assert.throws(
        () => parseDateTimeOption('not-a-date', 'from'),
        /Expected '--from' as date-time with explicit timezone/
      );
    });

    test('rejects calendar dates that do not exist', () => {
      assert.throws(
        () => parseDateTimeOption('2024-02-30T00:00:00Z', 'from'),
        /Expected '--from' as date-time with explicit timezone/
      );
    });

    test('rejects date-time values without an explicit timezone', () => {
      assert.throws(
        () => parseDateTimeOption('2026-01-01T00:00:00', 'from'),
        /Expected '--from' as date-time with explicit timezone/
      );
    });

    test('rejects implementation-dependent date syntax', () => {
      assert.throws(
        () => parseDateTimeOption('January 1, 2026', 'from'),
        /Expected '--from' as date-time with explicit timezone/
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
