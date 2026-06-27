import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  InstrumentIdType,
  InstrumentStatus
} from '../../generated/instruments';
import type { CommandRawOptions } from '../command-mechanics';
import {
  instrumentLookupArgNames,
  instrumentStatusArgNames,
  parseInstrumentLookupIdType,
  parseInstrumentLookupRequest,
  parseInstrumentsRequest,
  parseInstrumentStatus
} from './instruments-args';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
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
        parseInstrumentLookupIdType(rawOptions({ 'id-type': 'figi' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI
      );
      assert.equal(
        parseInstrumentLookupIdType(rawOptions({ 'id-type': 'ticker' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER
      );
      assert.equal(
        parseInstrumentLookupIdType(rawOptions({ 'id-type': 'uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_UID
      );
      assert.equal(
        parseInstrumentLookupIdType(rawOptions({ 'id-type': 'position-uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID
      );
    });

    test('rejects unknown id type names', () => {
      assert.throws(
        () => parseInstrumentLookupIdType(rawOptions({ 'id-type': 'isin' })),
        /Expected '--id-type' as one of: figi, ticker, uid, position-uid/
      );
    });
  });

  describe('parseInstrumentLookupRequest', () => {
    test('returns generated instrument lookup request', () => {
      assert.deepEqual(parseInstrumentLookupRequest(rawOptions({
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
        () => parseInstrumentLookupRequest(rawOptions({
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
      assert.equal(parseInstrumentStatus(rawOptions()), InstrumentStatus.INSTRUMENT_STATUS_BASE);
    });

    test('maps public status names to generated enum values', () => {
      assert.equal(
        parseInstrumentStatus(rawOptions({ 'instrument-status': 'unspecified' })),
        InstrumentStatus.INSTRUMENT_STATUS_UNSPECIFIED
      );
      assert.equal(
        parseInstrumentStatus(rawOptions({ 'instrument-status': 'base' })),
        InstrumentStatus.INSTRUMENT_STATUS_BASE
      );
      assert.equal(
        parseInstrumentStatus(rawOptions({ 'instrument-status': 'all' })),
        InstrumentStatus.INSTRUMENT_STATUS_ALL
      );
    });

    test('rejects unknown status names', () => {
      assert.throws(
        () => parseInstrumentStatus(rawOptions({ 'instrument-status': 'active' })),
        /Expected '--instrument-status' as one of: unspecified, base, all/
      );
    });
  });

  describe('parseInstrumentsRequest', () => {
    test('returns generated instruments request', () => {
      assert.deepEqual(parseInstrumentsRequest(rawOptions({ 'instrument-status': 'all' })), {
        instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_ALL
      });
    });
  });
});
