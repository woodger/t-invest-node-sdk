import { InstrumentStatus } from '../../generated/common';
import assert from 'node:assert';
import { describe, test } from 'node:test';
import { InstrumentIdType } from '../../generated/instruments';
import {
  createInstrumentLookupRequestFromOptions,
  createInstrumentsRequestFromOptions
} from './instruments-args';

describe('instruments args', () => {
  describe('createInstrumentLookupRequestFromOptions', () => {
    test('maps non-ticker id types to generated values', () => {
      const cases = [
        ['figi', InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI],
        ['uid', InstrumentIdType.INSTRUMENT_ID_TYPE_UID],
        ['position-uid', InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID]
      ] as const;

      for (const [idType, expected] of cases) {
        assert.deepEqual(createInstrumentLookupRequestFromOptions({
          id: 'instrument-id',
          'id-type': idType
        }), {
          id: 'instrument-id',
          idType: expected,
          classCode: ''
        });
      }
    });

    test('requires class code for ticker id type', () => {
      assert.throws(
        () => createInstrumentLookupRequestFromOptions({
          id: 'SBER',
          'id-type': 'ticker'
        }),
        /Expected required argument '--class-code' when '--id-type=ticker'/
      );
    });

    test('uses class code for ticker id type', () => {
      assert.deepEqual(createInstrumentLookupRequestFromOptions({
        id: 'SBER',
        'id-type': 'ticker',
        'class-code': 'TQBR'
      }), {
        id: 'SBER',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'TQBR'
      });
    });
  });

  describe('createInstrumentsRequestFromOptions', () => {
    test('maps public statuses to generated values', () => {
      const cases = [
        ['unspecified', InstrumentStatus.INSTRUMENT_STATUS_UNSPECIFIED],
        ['base', InstrumentStatus.INSTRUMENT_STATUS_BASE],
        ['all', InstrumentStatus.INSTRUMENT_STATUS_ALL]
      ] as const;

      for (const [status, expected] of cases) {
        assert.deepEqual(createInstrumentsRequestFromOptions({
          'instrument-status': status
        }), {
          instrumentStatus: expected
        });
      }
    });
  });
});
