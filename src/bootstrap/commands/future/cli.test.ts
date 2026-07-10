import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentIdType,
  type FutureResponse,
  type InstrumentRequest
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createFutureCommand,
  parseFutureFormat,
  parseFutureIdType,
  createFutureRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function futureResponse(overrides: Partial<FutureResponse> = {}): FutureResponse {
  return {
    instrument: undefined,
    ...overrides
  } as FutureResponse;
}

describe('future command', () => {
  describe('parseFutureIdType', () => {
    test('maps public id type names to generated enum values', () => {
      assert.equal(
        parseFutureIdType(rawOptions({ 'id-type': 'figi' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI
      );
      assert.equal(
        parseFutureIdType(rawOptions({ 'id-type': 'ticker' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER
      );
      assert.equal(
        parseFutureIdType(rawOptions({ 'id-type': 'uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_UID
      );
      assert.equal(
        parseFutureIdType(rawOptions({ 'id-type': 'position-uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID
      );
    });

    test('rejects unknown id type names', () => {
      assert.throws(
        () => parseFutureIdType(rawOptions({ 'id-type': 'isin' })),
        /Expected '--id-type' as one of: figi, ticker, uid, position-uid/
      );
    });
  });

  describe('createFutureRequest', () => {
    test('returns generated futureBy request', () => {
      const request = createFutureRequest({
        id: 'FUTFIGI',
        'id-type': 'figi'
      });

      assert.deepEqual(request, {
        id: 'FUTFIGI',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI,
        classCode: ''
      });
    });

    test('requires class code for ticker id type', () => {
      assert.throws(
        () => createFutureRequest({
          id: 'SiM6',
          'id-type': 'ticker'
        }),
        /Expected required argument '--class-code' when '--id-type=ticker'/
      );
    });

    test('uses class code for ticker id type', () => {
      const request = createFutureRequest({
        id: 'SiM6',
        'id-type': 'ticker',
        'class-code': 'SPBFUT'
      });

      assert.deepEqual(request, {
        id: 'SiM6',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'SPBFUT'
      });
    });
  });

  describe('parseFutureFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseFutureFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseFutureFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createFutureCommand', () => {
    test('calls futureBy and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: InstrumentRequest | undefined;
      let closeCalls = 0;
      const command = createFutureCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async futureBy(request) {
              receivedRequest = request;

              return futureResponse();
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
          'future',
          'show',
          '--token=token',
          '--endpoint=localhost:50051',
          '--id=SiM6',
          '--id-type=ticker',
          '--class-code=SPBFUT',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        id: 'SiM6',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'SPBFUT'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output), null);
    });

    test('closes sdk when futureBy rejects', async () => {
      let closeCalls = 0;
      const command = createFutureCommand(() => ({
        instruments: {
          async futureBy() {
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
            'future',
            'show',
            '--token=token',
            '--endpoint=localhost:50051',
            '--id=FUTFIGI',
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
