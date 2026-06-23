import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { InstrumentType } from '../../../generated/common';
import type {
  FindInstrumentRequest,
  FindInstrumentResponse,
  InstrumentShort
} from '../../../generated/instruments';
import type { CliArgs } from '../../cli-contract';
import {
  createFindInstrumentCommand,
  parseFindInstrumentFormat,
  parseFindInstrumentKind,
  parseFindInstrumentRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['instruments find-instrument'],
    ...args
  };
}

function instrument(overrides: Partial<InstrumentShort> = {}): InstrumentShort {
  return {
    isin: 'RU000A107UL4',
    figi: 'BBG00QPYJ5H0',
    ticker: 'TCSG',
    classCode: 'TQBR',
    instrumentType: 'share',
    name: 'TCS Group',
    uid: 'instrument-uid',
    positionUid: 'position-uid',
    instrumentKind: InstrumentType.INSTRUMENT_TYPE_SHARE,
    apiTradeAvailableFlag: true,
    forIisFlag: true,
    first1minCandleDate: new Date('2026-01-02T03:04:05Z'),
    first1dayCandleDate: new Date('2026-01-03T03:04:05Z'),
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    ...overrides
  };
}

function response(overrides: Partial<FindInstrumentResponse> = {}): FindInstrumentResponse {
  return {
    instruments: [instrument()],
    ...overrides
  };
}

describe('find-instrument command', () => {
  describe('parseFindInstrumentKind', () => {
    test('returns unspecified by default', () => {
      assert.equal(
        parseFindInstrumentKind(argv()),
        InstrumentType.INSTRUMENT_TYPE_UNSPECIFIED
      );
    });

    test('maps public instrument kind names to generated enum values', () => {
      assert.equal(parseFindInstrumentKind(argv({ 'instrument-kind': 'share' })), InstrumentType.INSTRUMENT_TYPE_SHARE);
      assert.equal(parseFindInstrumentKind(argv({ 'instrument-kind': 'bond' })), InstrumentType.INSTRUMENT_TYPE_BOND);
      assert.equal(
        parseFindInstrumentKind(argv({ 'instrument-kind': 'clearing-certificate' })),
        InstrumentType.INSTRUMENT_TYPE_CLEARING_CERTIFICATE
      );
    });

    test('rejects unknown instrument kind names', () => {
      assert.throws(
        () => parseFindInstrumentKind(argv({ 'instrument-kind': 'stock' })),
        /Expected '--instrument-kind' as one of: unspecified, bond, share/
      );
    });
  });

  describe('parseFindInstrumentRequest', () => {
    test('returns generated findInstrument request', () => {
      const request = parseFindInstrumentRequest(argv({
        query: 'TCSG',
        'instrument-kind': 'share',
        'api-trade-available': true
      }));

      assert.deepEqual(request, {
        query: 'TCSG',
        instrumentKind: InstrumentType.INSTRUMENT_TYPE_SHARE,
        apiTradeAvailableFlag: true
      });
    });

    test('requires query', () => {
      assert.throws(
        () => parseFindInstrumentRequest(argv()),
        /Expected required argument '--query'/
      );
    });
  });

  describe('parseFindInstrumentFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseFindInstrumentFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseFindInstrumentFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createFindInstrumentCommand', () => {
    test('calls findInstrument and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: FindInstrumentRequest | undefined;
      let findInstrumentCalls = 0;
      let closeCalls = 0;
      const command = createFindInstrumentCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async findInstrument(request) {
              receivedRequest = request;
              findInstrumentCalls += 1;

              return response();
            }
          },
          close() {
            closeCalls += 1;
          }
        };
      });

      const output = await command(argv({
        token: 'token',
        endpoint: 'localhost:50051',
        query: 'TCSG',
        'instrument-kind': 'share',
        'api-trade-available': true,
        format: 'json'
      }));

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(findInstrumentCalls, 1);
      assert.deepEqual(receivedRequest, {
        query: 'TCSG',
        instrumentKind: InstrumentType.INSTRUMENT_TYPE_SHARE,
        apiTradeAvailableFlag: true
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].ticker, 'TCSG');
    });

    test('closes sdk when findInstrument rejects', async () => {
      let closeCalls = 0;
      const command = createFindInstrumentCommand(() => ({
        instruments: {
          async findInstrument() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => command(argv({
          token: 'token',
          endpoint: 'localhost:50051',
          query: 'TCSG'
        })),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
