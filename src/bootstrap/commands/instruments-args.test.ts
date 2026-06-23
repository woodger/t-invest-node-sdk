import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  InstrumentIdType,
  InstrumentStatus
} from '../../generated/instruments';
import type { CliArgs } from '../cli-contract';
import {
  instrumentLookupArgNames,
  instrumentStatusArgNames,
  parseInstrumentLookupIdType,
  parseInstrumentLookupRequest,
  parseInstrumentsRequest,
  parseInstrumentStatus
} from './instruments-args';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: [],
    ...args
  };
}

describe('instruments args', () => {
  describe('instrumentLookupArgNames', () => {
    test('lists lookup option names', () => {
      assert.equal(instrumentLookupArgNames.has('id'), true);
      assert.equal(instrumentLookupArgNames.has('id-type'), true);
      assert.equal(instrumentLookupArgNames.has('class-code'), true);
    });
  });

  describe('parseInstrumentLookupIdType', () => {
    test('maps public id type names to generated enum values', () => {
      assert.equal(
        parseInstrumentLookupIdType(argv({ 'id-type': 'figi' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI
      );
      assert.equal(
        parseInstrumentLookupIdType(argv({ 'id-type': 'ticker' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER
      );
      assert.equal(
        parseInstrumentLookupIdType(argv({ 'id-type': 'uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_UID
      );
      assert.equal(
        parseInstrumentLookupIdType(argv({ 'id-type': 'position-uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID
      );
    });

    test('rejects unknown id type names', () => {
      assert.throws(
        () => parseInstrumentLookupIdType(argv({ 'id-type': 'isin' })),
        /Expected '--id-type' as one of: figi, ticker, uid, position-uid/
      );
    });
  });

  describe('parseInstrumentLookupRequest', () => {
    test('returns generated instrument lookup request', () => {
      assert.deepEqual(parseInstrumentLookupRequest(argv({
        id: 'BBG004730N88',
        'id-type': 'figi'
      })), {
        id: 'BBG004730N88',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI,
        classCode: ''
      });
    });

    test('requires class code for ticker id type', () => {
      assert.throws(
        () => parseInstrumentLookupRequest(argv({
          id: 'SBER',
          'id-type': 'ticker'
        })),
        /Expected required argument '--class-code' when '--id-type=ticker'/
      );
    });
  });

  describe('instrumentStatusArgNames', () => {
    test('lists status option name', () => {
      assert.equal(instrumentStatusArgNames.has('instrument-status'), true);
    });
  });

  describe('parseInstrumentStatus', () => {
    test('returns base by default', () => {
      assert.equal(parseInstrumentStatus(argv()), InstrumentStatus.INSTRUMENT_STATUS_BASE);
    });

    test('maps public status names to generated enum values', () => {
      assert.equal(
        parseInstrumentStatus(argv({ 'instrument-status': 'unspecified' })),
        InstrumentStatus.INSTRUMENT_STATUS_UNSPECIFIED
      );
      assert.equal(
        parseInstrumentStatus(argv({ 'instrument-status': 'base' })),
        InstrumentStatus.INSTRUMENT_STATUS_BASE
      );
      assert.equal(
        parseInstrumentStatus(argv({ 'instrument-status': 'all' })),
        InstrumentStatus.INSTRUMENT_STATUS_ALL
      );
    });

    test('rejects unknown status names', () => {
      assert.throws(
        () => parseInstrumentStatus(argv({ 'instrument-status': 'active' })),
        /Expected '--instrument-status' as one of: unspecified, base, all/
      );
    });
  });

  describe('parseInstrumentsRequest', () => {
    test('returns generated instruments request', () => {
      assert.deepEqual(parseInstrumentsRequest(argv({ 'instrument-status': 'all' })), {
        instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_ALL
      });
    });
  });
});
