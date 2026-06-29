import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  assertSideEffectConfirmed,
  parseOptionalPositiveQuotationOption,
  parsePositiveQuotationOption
} from './side-effect-args';

describe('side-effect command args', () => {
  describe('assertSideEffectConfirmed', () => {
    test('accepts explicit confirmation only', () => {
      assert.doesNotThrow(() => assertSideEffectConfirmed(true));
      assert.throws(
        () => assertSideEffectConfirmed(false),
        /Expected '--confirm' to execute side-effect command/
      );
      assert.throws(
        () => assertSideEffectConfirmed(undefined),
        /Expected '--confirm' to execute side-effect command/
      );
    });
  });

  describe('parsePositiveQuotationOption', () => {
    test('parses decimal values into generated quotation', () => {
      assert.deepEqual(parsePositiveQuotationOption('100', 'price'), {
        units: 100,
        nano: 0
      });
      assert.deepEqual(parsePositiveQuotationOption('100.25', 'price'), {
        units: 100,
        nano: 250_000_000
      });
      assert.deepEqual(parsePositiveQuotationOption('0.000000001', 'price'), {
        units: 0,
        nano: 1
      });
    });

    test('rejects zero, negative and unsupported decimal forms', () => {
      assert.throws(
        () => parsePositiveQuotationOption('0', 'price'),
        /Expected '--price' as decimal greater than 0 with up to 9 fractional digits/
      );
      assert.throws(
        () => parsePositiveQuotationOption('-1', 'price'),
        /Expected '--price' as decimal greater than 0 with up to 9 fractional digits/
      );
      assert.throws(
        () => parsePositiveQuotationOption('1.1234567890', 'price'),
        /Expected '--price' as decimal greater than 0 with up to 9 fractional digits/
      );
      assert.throws(
        () => parsePositiveQuotationOption('1e2', 'price'),
        /Expected '--price' as decimal greater than 0 with up to 9 fractional digits/
      );
    });
  });

  describe('parseOptionalPositiveQuotationOption', () => {
    test('keeps missing values undefined', () => {
      assert.equal(parseOptionalPositiveQuotationOption(undefined, 'price'), undefined);
    });
  });
});
