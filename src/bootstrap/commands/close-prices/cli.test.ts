import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { Quotation } from '../../../generated/common';
import type {
  GetClosePricesRequest,
  GetClosePricesResponse,
  InstrumentClosePriceResponse
} from '../../../generated/marketdata';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createClosePricesCommand,
  parseClosePricesFormat,
  parseClosePricesInstrumentIds,
  createClosePricesRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function quotation(units: number, nano: number): Quotation {
  return {
    units,
    nano
  };
}

function closePrice(
  overrides: Partial<InstrumentClosePriceResponse> = {}
): InstrumentClosePriceResponse {
  return {
    figi: 'BBG00QPYJ5H0',
    instrumentUid: 'instrument-uid',
    price: quotation(100, 0),
    time: new Date('2026-06-19T00:00:00.000Z'),
    ...overrides
  };
}

function closePricesResponse(
  overrides: Partial<GetClosePricesResponse> = {}
): GetClosePricesResponse {
  return {
    closePrices: [closePrice()],
    ...overrides
  };
}

describe('close-prices command', () => {
  describe('parseClosePricesInstrumentIds', () => {
    test('returns one instrument id', () => {
      assert.deepEqual(
        parseClosePricesInstrumentIds(rawOptions({ 'instrument-id': 'BBG00QPYJ5H0' })),
        ['BBG00QPYJ5H0']
      );
    });

    test('returns trimmed comma-separated instrument ids', () => {
      assert.deepEqual(
        parseClosePricesInstrumentIds(rawOptions({
          'instrument-id': 'BBG00QPYJ5H0, instrument-uid'
        })),
        ['BBG00QPYJ5H0', 'instrument-uid']
      );
    });

    test('rejects empty comma-separated items', () => {
      assert.throws(
        () => parseClosePricesInstrumentIds(rawOptions({ 'instrument-id': 'BBG00QPYJ5H0,,instrument-uid' })),
        /Expected '--instrument-id' as comma-separated list/
      );
    });
  });

  describe('createClosePricesRequest', () => {
    test('returns generated getClosePrices request', () => {
      const request = createClosePricesRequest({
        'instrument-id': 'BBG00QPYJ5H0,instrument-uid'
      });

      assert.deepEqual(request.instruments, [
        { instrumentId: 'BBG00QPYJ5H0' },
        { instrumentId: 'instrument-uid' }
      ]);
    });
  });

  describe('parseClosePricesFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseClosePricesFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseClosePricesFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createClosePricesCommand', () => {
    test('calls getClosePrices and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetClosePricesRequest | undefined;
      let closeCalls = 0;
      const command = createClosePricesCommand((options) => {
        receivedOptions = options;

        return {
          marketdata: {
            async getClosePrices(request) {
              receivedRequest = request;

              return closePricesResponse();
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
          'marketdata',
          'get-close-prices',
          '--token=token',
          '--endpoint=localhost:50051',
          '--instrument-id=BBG00QPYJ5H0,instrument-uid',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest?.instruments, [
        { instrumentId: 'BBG00QPYJ5H0' },
        { instrumentId: 'instrument-uid' }
      ]);
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].figi, 'BBG00QPYJ5H0');
    });

    test('closes sdk when getClosePrices rejects', async () => {
      let closeCalls = 0;
      const command = createClosePricesCommand(() => ({
        marketdata: {
          async getClosePrices() {
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
            'marketdata',
            'get-close-prices',
            '--token=token',
            '--endpoint=localhost:50051',
            '--instrument-id=BBG00QPYJ5H0'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
