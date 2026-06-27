import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentIdType,
  type BondResponse,
  type InstrumentRequest
} from '../../../generated/instruments';
import type { CliArgs } from '../../cli-contract';
import {
  createBondCommand,
  parseBondFormat,
  parseBondIdType,
  parseBondRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['instruments bond-by'],
    ...args
  };
}

function bondResponse(overrides: Partial<BondResponse> = {}): BondResponse {
  return {
    instrument: undefined,
    ...overrides
  };
}

describe('bond command', () => {
  describe('parseBondIdType', () => {
    test('maps public id type names to generated enum values', () => {
      assert.equal(
        parseBondIdType(argv({ 'id-type': 'figi' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI
      );
      assert.equal(
        parseBondIdType(argv({ 'id-type': 'ticker' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER
      );
      assert.equal(
        parseBondIdType(argv({ 'id-type': 'uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_UID
      );
      assert.equal(
        parseBondIdType(argv({ 'id-type': 'position-uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID
      );
    });

    test('rejects unknown id type names', () => {
      assert.throws(
        () => parseBondIdType(argv({ 'id-type': 'isin' })),
        /Expected '--id-type' as one of: figi, ticker, uid, position-uid/
      );
    });
  });

  describe('parseBondRequest', () => {
    test('returns generated bondBy request', () => {
      const request = parseBondRequest(argv({
        id: 'BBG00B9XRY4J',
        'id-type': 'figi'
      }));

      assert.deepEqual(request, {
        id: 'BBG00B9XRY4J',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI,
        classCode: ''
      });
    });

    test('requires class code for ticker id type', () => {
      assert.throws(
        () => parseBondRequest(argv({
          id: 'SU26238RMFS4',
          'id-type': 'ticker'
        })),
        /Expected required argument '--class-code' when '--id-type=ticker'/
      );
    });

    test('uses class code for ticker id type', () => {
      const request = parseBondRequest(argv({
        id: 'SU26238RMFS4',
        'id-type': 'ticker',
        'class-code': 'TQOB'
      }));

      assert.deepEqual(request, {
        id: 'SU26238RMFS4',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'TQOB'
      });
    });
  });

  describe('parseBondFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseBondFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseBondFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createBondCommand', () => {
    test('calls bondBy and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: InstrumentRequest | undefined;
      let closeCalls = 0;
      const command = createBondCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async bondBy(request) {
              receivedRequest = request;

              return bondResponse();
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
          'bond-by',
          '--token=token',
          '--endpoint=localhost:50051',
          '--id=SU26238RMFS4',
          '--id-type=ticker',
          '--class-code=TQOB',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        id: 'SU26238RMFS4',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'TQOB'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output), null);
    });

    test('closes sdk when bondBy rejects', async () => {
      let closeCalls = 0;
      const command = createBondCommand(() => ({
        instruments: {
          async bondBy() {
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
            'bond-by',
            '--token=token',
            '--endpoint=localhost:50051',
            '--id=BBG00B9XRY4J',
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
