import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { InstrumentType } from '../../../generated/t_tech/invest/grpc/common';
import type {
  FindInstrumentRequest,
  FindInstrumentResponse,
  InstrumentShort
} from '../../../generated/t_tech/invest/grpc/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createFindInstrumentCommand,
  parseFindInstrumentFormat,
  parseFindInstrumentKind,
  createFindInstrumentRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
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
  } as InstrumentShort;
}

function response(overrides: Partial<FindInstrumentResponse> = {}): FindInstrumentResponse {
  return {
    instruments: [instrument()],
    ...overrides
  } as FindInstrumentResponse;
}

describe('find-instrument command', () => {
  describe('parseFindInstrumentKind', () => {
    test('returns unspecified by default', () => {
      assert.equal(
        parseFindInstrumentKind(rawOptions()),
        InstrumentType.INSTRUMENT_TYPE_UNSPECIFIED
      );
    });

    test('maps public instrument kind names to generated enum values', () => {
      assert.equal(parseFindInstrumentKind(rawOptions({ 'instrument-kind': 'share' })), InstrumentType.INSTRUMENT_TYPE_SHARE);
      assert.equal(parseFindInstrumentKind(rawOptions({ 'instrument-kind': 'bond' })), InstrumentType.INSTRUMENT_TYPE_BOND);
      assert.equal(
        parseFindInstrumentKind(rawOptions({ 'instrument-kind': 'clearing-certificate' })),
        InstrumentType.INSTRUMENT_TYPE_CLEARING_CERTIFICATE
      );
    });

    test('rejects unknown instrument kind names', () => {
      assert.throws(
        () => parseFindInstrumentKind(rawOptions({ 'instrument-kind': 'stock' })),
        /Expected '--instrument-kind' as one of: unspecified, bond, share/
      );
    });
  });

  describe('createFindInstrumentRequest', () => {
    test('returns generated findInstrument request', () => {
      const request = createFindInstrumentRequest({
        query: 'TCSG',
        'instrument-kind': 'share',
        'api-trade-available': true
      });

      assert.deepEqual(request, {
        query: 'TCSG',
        instrumentKind: InstrumentType.INSTRUMENT_TYPE_SHARE,
        apiTradeAvailableFlag: true
      });
    });

  });

  describe('parseFindInstrumentFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseFindInstrumentFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseFindInstrumentFormat(rawOptions({ format: 'xml' })),
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

      const output = await commandFacade.run(
        command,
        [
          'instrument',
          'search',
          '--token=token',
          '--endpoint=localhost:50051',
          '--query=TCSG',
          '--instrument-kind=share',
          '--api-trade-available',
          '--format=json'
        ],
        undefined
      );

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
        () => commandFacade.run(
          command,
          [
            'instrument',
            'search',
            '--token=token',
            '--endpoint=localhost:50051',
            '--query=TCSG'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
