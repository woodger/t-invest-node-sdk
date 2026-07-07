import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentIdType,
  type InstrumentRequest,
  type ShareResponse
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createShareCommand,
  parseShareFormat,
  parseShareIdType,
  createShareRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function shareResponse(overrides: Partial<ShareResponse> = {}): ShareResponse {
  return {
    instrument: undefined,
    ...overrides
  };
}

describe('share command', () => {
  describe('parseShareIdType', () => {
    test('maps public id type names to generated enum values', () => {
      assert.equal(
        parseShareIdType(rawOptions({ 'id-type': 'figi' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI
      );
      assert.equal(
        parseShareIdType(rawOptions({ 'id-type': 'ticker' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER
      );
      assert.equal(
        parseShareIdType(rawOptions({ 'id-type': 'uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_UID
      );
      assert.equal(
        parseShareIdType(rawOptions({ 'id-type': 'position-uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID
      );
    });

    test('rejects unknown id type names', () => {
      assert.throws(
        () => parseShareIdType(rawOptions({ 'id-type': 'isin' })),
        /Expected '--id-type' as one of: figi, ticker, uid, position-uid/
      );
    });
  });

  describe('createShareRequest', () => {
    test('returns generated shareBy request', () => {
      const request = createShareRequest({
        id: 'BBG004730N88',
        'id-type': 'figi'
      });

      assert.deepEqual(request, {
        id: 'BBG004730N88',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI,
        classCode: ''
      });
    });

    test('requires class code for ticker id type', () => {
      assert.throws(
        () => createShareRequest({
          id: 'SBER',
          'id-type': 'ticker'
        }),
        /Expected required argument '--class-code' when '--id-type=ticker'/
      );
    });

    test('uses class code for ticker id type', () => {
      const request = createShareRequest({
        id: 'SBER',
        'id-type': 'ticker',
        'class-code': 'TQBR'
      });

      assert.deepEqual(request, {
        id: 'SBER',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'TQBR'
      });
    });
  });

  describe('parseShareFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseShareFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseShareFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createShareCommand', () => {
    test('calls shareBy and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: InstrumentRequest | undefined;
      let closeCalls = 0;
      const command = createShareCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async shareBy(request) {
              receivedRequest = request;

              return shareResponse();
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
          'share-by',
          '--token=token',
          '--endpoint=localhost:50051',
          '--id=SBER',
          '--id-type=ticker',
          '--class-code=TQBR',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        id: 'SBER',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'TQBR'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output), null);
    });

    test('closes sdk when shareBy rejects', async () => {
      let closeCalls = 0;
      const command = createShareCommand(() => ({
        instruments: {
          async shareBy() {
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
            'share-by',
            '--token=token',
            '--endpoint=localhost:50051',
            '--id=BBG004730N88',
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
