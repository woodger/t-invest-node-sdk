import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  InstrumentIdType,
  type CurrencyResponse,
  type InstrumentRequest
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createCurrencyCommand,
  parseCurrencyFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function currencyResponse(overrides: Partial<CurrencyResponse> = {}): CurrencyResponse {
  return {
    instrument: undefined,
    ...overrides
  } as CurrencyResponse;
}

describe('currency command', () => {
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
      let receivedOptions: TInvestOptions | undefined;
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
          'instrument',
          'currency',
          'show',
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
            'instrument',
            'currency',
            'show',
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
