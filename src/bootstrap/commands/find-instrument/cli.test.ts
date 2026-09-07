import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import { InstrumentType } from '../../../generated/common';
import type {
  FindInstrumentRequest,
  FindInstrumentResponse,
  InstrumentShort
} from '../../../generated/instruments';
import { createFindInstrumentCommand, createFindInstrumentRequest } from './cli';

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

    test('maps unspecified, bond, and clearing certificate kinds', () => {
      const cases = [
        ['unspecified', InstrumentType.INSTRUMENT_TYPE_UNSPECIFIED],
        ['bond', InstrumentType.INSTRUMENT_TYPE_BOND],
        ['clearing-certificate', InstrumentType.INSTRUMENT_TYPE_CLEARING_CERTIFICATE]
      ] as const;

      for (const [instrumentKind, expected] of cases) {
        assert.deepEqual(createFindInstrumentRequest({
          query: 'instrument',
          'instrument-kind': instrumentKind,
          'api-trade-available': false
        }), {
          query: 'instrument',
          instrumentKind: expected,
          apiTradeAvailableFlag: false
        });
      }
    });
  });

  describe('createFindInstrumentCommand', () => {
    test('calls findInstrument and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
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
