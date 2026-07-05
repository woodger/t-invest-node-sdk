import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  resolveInstrumentIdOption,
  resolveOptionalInstrumentIdOption
} from './instrument-id-options';

describe('instrument id options', () => {
  describe('resolveInstrumentIdOption', () => {
    test('returns canonical instrument-id option', () => {
      assert.equal(
        resolveInstrumentIdOption({
          'instrument-id': 'instrument-id'
        }),
        'instrument-id'
      );
    });

    test('keeps deprecated figi option as an alias', () => {
      assert.equal(
        resolveInstrumentIdOption({
          figi: 'figi-id'
        }),
        'figi-id'
      );
    });

    test('rejects ambiguous canonical and deprecated options', () => {
      assert.throws(
        () => resolveInstrumentIdOption({
          'instrument-id': 'instrument-id',
          figi: 'figi-id'
        }),
        /Use either '--instrument-id' or deprecated '--figi', not both/
      );
    });

    test('requires canonical instrument-id when both options are absent', () => {
      assert.throws(
        () => resolveInstrumentIdOption({}),
        /Expected '--instrument-id'/
      );
    });
  });

  describe('resolveOptionalInstrumentIdOption', () => {
    test('returns undefined when both options are absent', () => {
      assert.equal(resolveOptionalInstrumentIdOption({}), undefined);
    });
  });
});
