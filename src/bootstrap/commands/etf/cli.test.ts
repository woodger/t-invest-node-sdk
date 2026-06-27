import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentIdType,
  type EtfResponse,
  type InstrumentRequest
} from '../../../generated/instruments';
import type { CliArgs } from '../../cli-contract';
import {
  createEtfCommand,
  parseEtfFormat,
  parseEtfIdType,
  parseEtfRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['instruments etf-by'],
    ...args
  };
}

function etfResponse(overrides: Partial<EtfResponse> = {}): EtfResponse {
  return {
    instrument: undefined,
    ...overrides
  };
}

describe('etf command', () => {
  describe('parseEtfIdType', () => {
    test('maps public id type names to generated enum values', () => {
      assert.equal(
        parseEtfIdType(argv({ 'id-type': 'figi' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI
      );
      assert.equal(
        parseEtfIdType(argv({ 'id-type': 'ticker' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER
      );
      assert.equal(
        parseEtfIdType(argv({ 'id-type': 'uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_UID
      );
      assert.equal(
        parseEtfIdType(argv({ 'id-type': 'position-uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID
      );
    });

    test('rejects unknown id type names', () => {
      assert.throws(
        () => parseEtfIdType(argv({ 'id-type': 'isin' })),
        /Expected '--id-type' as one of: figi, ticker, uid, position-uid/
      );
    });
  });

  describe('parseEtfRequest', () => {
    test('returns generated etfBy request', () => {
      const request = parseEtfRequest(argv({
        id: 'BBG333333333',
        'id-type': 'figi'
      }));

      assert.deepEqual(request, {
        id: 'BBG333333333',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI,
        classCode: ''
      });
    });

    test('requires class code for ticker id type', () => {
      assert.throws(
        () => parseEtfRequest(argv({
          id: 'TMOS',
          'id-type': 'ticker'
        })),
        /Expected required argument '--class-code' when '--id-type=ticker'/
      );
    });

    test('uses class code for ticker id type', () => {
      const request = parseEtfRequest(argv({
        id: 'TMOS',
        'id-type': 'ticker',
        'class-code': 'TQTF'
      }));

      assert.deepEqual(request, {
        id: 'TMOS',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'TQTF'
      });
    });
  });

  describe('parseEtfFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseEtfFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseEtfFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createEtfCommand', () => {
    test('calls etfBy and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: InstrumentRequest | undefined;
      let closeCalls = 0;
      const command = createEtfCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async etfBy(request) {
              receivedRequest = request;

              return etfResponse();
            }
          },
          close() {
            closeCalls += 1;
          }
        };
      });

      const output = await runCommand(
        command,
        [
          'instruments',
          'etf-by',
          '--token=token',
          '--endpoint=localhost:50051',
          '--id=TMOS',
          '--id-type=ticker',
          '--class-code=TQTF',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        id: 'TMOS',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'TQTF'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output), null);
    });

    test('closes sdk when etfBy rejects', async () => {
      let closeCalls = 0;
      const command = createEtfCommand(() => ({
        instruments: {
          async etfBy() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => runCommand(
          command,
          [
            'instruments',
            'etf-by',
            '--token=token',
            '--endpoint=localhost:50051',
            '--id=BBG333333333',
            '--id-type=figi'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
