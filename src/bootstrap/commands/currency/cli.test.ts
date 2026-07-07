import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentIdType,
  type CurrencyResponse,
  type InstrumentRequest
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createCurrencyCommand,
  parseCurrencyFormat,
  parseCurrencyIdType,
  createCurrencyRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function currencyResponse(overrides: Partial<CurrencyResponse> = {}): CurrencyResponse {
  return {
    instrument: undefined,
    ...overrides
  };
}

describe('currency command', () => {
  describe('parseCurrencyIdType', () => {
    test('maps public id type names to generated enum values', () => {
      assert.equal(
        parseCurrencyIdType(rawOptions({ 'id-type': 'figi' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI
      );
      assert.equal(
        parseCurrencyIdType(rawOptions({ 'id-type': 'ticker' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER
      );
      assert.equal(
        parseCurrencyIdType(rawOptions({ 'id-type': 'uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_UID
      );
      assert.equal(
        parseCurrencyIdType(rawOptions({ 'id-type': 'position-uid' })),
        InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID
      );
    });

    test('rejects unknown id type names', () => {
      assert.throws(
        () => parseCurrencyIdType(rawOptions({ 'id-type': 'isin' })),
        /Expected '--id-type' as one of: figi, ticker, uid, position-uid/
      );
    });
  });

  describe('createCurrencyRequest', () => {
    test('returns generated currencyBy request', () => {
      const request = createCurrencyRequest({
        id: 'BBG0013HGFT4',
        'id-type': 'figi'
      });

      assert.deepEqual(request, {
        id: 'BBG0013HGFT4',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI,
        classCode: ''
      });
    });

    test('requires class code for ticker id type', () => {
      assert.throws(
        () => createCurrencyRequest({
          id: 'USD000UTSTOM',
          'id-type': 'ticker'
        }),
        /Expected required argument '--class-code' when '--id-type=ticker'/
      );
    });

    test('uses class code for ticker id type', () => {
      const request = createCurrencyRequest({
        id: 'USD000UTSTOM',
        'id-type': 'ticker',
        'class-code': 'CETS'
      });

      assert.deepEqual(request, {
        id: 'USD000UTSTOM',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'CETS'
      });
    });
  });

  describe('parseCurrencyFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseCurrencyFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseCurrencyFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createCurrencyCommand', () => {
    test('calls currencyBy and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: InstrumentRequest | undefined;
      let closeCalls = 0;
      const command = createCurrencyCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async currencyBy(request) {
              receivedRequest = request;

              return currencyResponse();
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
          'instruments',
          'currency-by',
          '--token=token',
          '--endpoint=localhost:50051',
          '--id=USD000UTSTOM',
          '--id-type=ticker',
          '--class-code=CETS',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        id: 'USD000UTSTOM',
        idType: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
        classCode: 'CETS'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output), null);
    });

    test('closes sdk when currencyBy rejects', async () => {
      let closeCalls = 0;
      const command = createCurrencyCommand(() => ({
        instruments: {
          async currencyBy() {
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
            'instruments',
            'currency-by',
            '--token=token',
            '--endpoint=localhost:50051',
            '--id=BBG0013HGFT4',
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
