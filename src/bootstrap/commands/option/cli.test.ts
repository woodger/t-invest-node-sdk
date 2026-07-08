import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentIdType,
  type InstrumentRequest,
  type OptionResponse
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createOptionCommand,
  parseOptionFormat,
  parseOptionIdType,
  createOptionRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function optionResponse(overrides: Partial<OptionResponse> = {}): OptionResponse {
  return {
    instrument: undefined,
    ...overrides
  };
}

describe('option command', () => {
  describe('parseOptionIdType', () => {
    test('maps public id type names to generated enum values', () => {
      assert.equal(
        parseOptionIdType(rawOptions({ 'id-type': 'figi' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI
      );
      assert.equal(
        parseOptionIdType(rawOptions({ 'id-type': 'ticker' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER
      );
      assert.equal(
        parseOptionIdType(rawOptions({ 'id-type': 'uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_UID
      );
      assert.equal(
        parseOptionIdType(rawOptions({ 'id-type': 'position-uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID
      );
    });

    test('rejects unknown id type names', () => {
      assert.throws(
        () => parseOptionIdType(rawOptions({ 'id-type': 'isin' })),
        /Expected '--id-type' as one of: figi, ticker, uid, position-uid/
      );
    });
  });

  describe('createOptionRequest', () => {
    test('returns generated optionBy request', () => {
      const request = createOptionRequest({
        id: 'OPTIONUID',
        'id-type': 'uid'
      });

      assert.deepEqual(request, {
        id: 'OPTIONUID',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_UID,
        classCode: ''
      });
    });

    test('requires class code for ticker id type', () => {
      assert.throws(
        () => createOptionRequest({
          id: 'OPTIONTICKER',
          'id-type': 'ticker'
        }),
        /Expected required argument '--class-code' when '--id-type=ticker'/
      );
    });

    test('uses class code for ticker id type', () => {
      const request = createOptionRequest({
        id: 'OPTIONTICKER',
        'id-type': 'ticker',
        'class-code': 'SPBOPT'
      });

      assert.deepEqual(request, {
        id: 'OPTIONTICKER',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'SPBOPT'
      });
    });
  });

  describe('parseOptionFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseOptionFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseOptionFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createOptionCommand', () => {
    test('calls optionBy and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: InstrumentRequest | undefined;
      let closeCalls = 0;
      const command = createOptionCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async optionBy(request) {
              receivedRequest = request;

              return optionResponse();
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
          'option',
          'show',
          '--token=token',
          '--endpoint=localhost:50051',
          '--id=OPTIONTICKER',
          '--id-type=ticker',
          '--class-code=SPBOPT',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        id: 'OPTIONTICKER',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'SPBOPT'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output), null);
    });

    test('closes sdk when optionBy rejects', async () => {
      let closeCalls = 0;
      const command = createOptionCommand(() => ({
        instruments: {
          async optionBy() {
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
            'option',
            'show',
            '--token=token',
            '--endpoint=localhost:50051',
            '--id=OPTIONUID',
            '--id-type=uid'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
