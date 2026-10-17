import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import { parseOptions } from 'icore';
import {
  parseCommaSeparatedStringListOption,
  parseDateTimeOption,
  parseOptionalNonNegativeInt32Option,
  parseRequiredDateTimeOption,
  maxInt32,
  positiveSafeIntegerOption,
  positiveInt32Option,
  requireStringOption,
  withSdkOptions
} from './command-options';

const maxSafeInteger = Number.MAX_SAFE_INTEGER;
const firstUnsafeInteger = maxSafeInteger + 1;
const firstOutOfRangeInt32 = maxInt32 + 1;

describe('command options', () => {
  describe('withSdkOptions', () => {
    test('allows common SDK options with command-specific options', () => {
      const options = parseOptions(
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
        ),
        {
          token: 'token',
          endpoint: 'localhost:50051',
          format: 'json',
          cursor: 'next'
        }
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

  describe('positiveSafeIntegerOption', () => {
    test('parses a positive integer', () => {
      assert.deepEqual(
        parseOptions(
          { quantity: positiveSafeIntegerOption },
          { quantity: '10' }
        ),
        { quantity: 10 }
      );
    });

    test('rejects zero', () => {
      assert.throws(
        () =>
          parseOptions(
            { quantity: positiveSafeIntegerOption },
            { quantity: '0' }
          ),
        /Expected '--quantity' to be greater than or equal to 1/
      );
    });

    test('rejects fractional values', () => {
      assert.throws(
        () =>
          parseOptions(
            { quantity: positiveSafeIntegerOption },
            { quantity: '1.5' }
          ),
        /Expected '--quantity' as integer/
      );
    });

    test('rejects positive integers outside the safe number range', () => {
      assert.throws(
        () =>
          parseOptions(
            { quantity: positiveSafeIntegerOption },
            { quantity: String(firstUnsafeInteger) }
          ),
        new RegExp(
          `Expected '--quantity' to be less than or equal to ${maxSafeInteger}`
        )
      );
    });
  });

  describe('positiveInt32Option', () => {
    test('accepts the maximum positive int32', () => {
      assert.deepEqual(
        parseOptions(
          { depth: positiveInt32Option },
          { depth: String(maxInt32) }
        ),
        { depth: maxInt32 }
      );
    });

    test('rejects the first integer outside int32', () => {
      assert.throws(
        () =>
          parseOptions(
            { depth: positiveInt32Option },
            { depth: String(firstOutOfRangeInt32) }
          ),
        new RegExp(
          `Expected '--depth' to be less than or equal to ${maxInt32}`
        )
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
        () =>
          parseCommaSeparatedStringListOption('first,,second', 'instrument-id'),
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

  describe('parseOptionalNonNegativeInt32Option', () => {
    test('returns zero when option is absent', () => {
      assert.equal(parseOptionalNonNegativeInt32Option(undefined, 'page'), 0);
    });

    test('returns parsed non-negative integer', () => {
      assert.equal(parseOptionalNonNegativeInt32Option('2', 'page'), 2);
    });

    test('rejects negative integer values', () => {
      assert.throws(
        () => parseOptionalNonNegativeInt32Option('-1', 'page'),
        /Expected '--page' as integer greater than or equal to 0/
      );
    });

    test('accepts the maximum int32 page', () => {
      assert.equal(
        parseOptionalNonNegativeInt32Option(String(maxInt32), 'page'),
        maxInt32
      );
    });

    test('rejects pages outside int32', () => {
      assert.throws(
        () =>
          parseOptionalNonNegativeInt32Option(
            String(firstOutOfRangeInt32),
            'page'
          ),
        new RegExp(
          `Expected '--page' to be less than or equal to ${maxInt32}`
        )
      );
    });
  });
});
