import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { Quotation } from '../../../generated/common';
import type {
  GetLastPricesRequest,
  GetLastPricesResponse,
  LastPrice
} from '../../../generated/marketdata';
import type { CommandRawOptions } from '../../command-mechanics';
import {
  createLastPricesCommand,
  parseLastPricesFormat,
  parseLastPricesInstrumentIds,
  parseLastPricesRequest
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

function lastPrice(overrides: Partial<LastPrice> = {}): LastPrice {
  return {
    figi: 'BBG00QPYJ5H0',
    price: quotation(100, 0),
    time: new Date('2026-06-19T10:00:00.000Z'),
    instrumentUid: 'instrument-uid',
    ...overrides
  };
}

function lastPricesResponse(
  overrides: Partial<GetLastPricesResponse> = {}
): GetLastPricesResponse {
  return {
    lastPrices: [lastPrice()],
    ...overrides
  };
}

describe('last-prices command', () => {
  describe('parseLastPricesInstrumentIds', () => {
    test('returns one instrument id', () => {
      assert.deepEqual(
        parseLastPricesInstrumentIds(rawOptions({ 'instrument-id': 'BBG00QPYJ5H0' })),
        ['BBG00QPYJ5H0']
      );
    });

    test('returns trimmed comma-separated instrument ids', () => {
      assert.deepEqual(
        parseLastPricesInstrumentIds(rawOptions({
          'instrument-id': 'BBG00QPYJ5H0, instrument-uid'
        })),
        ['BBG00QPYJ5H0', 'instrument-uid']
      );
    });

    test('rejects empty comma-separated items', () => {
      assert.throws(
        () => parseLastPricesInstrumentIds(rawOptions({ 'instrument-id': 'BBG00QPYJ5H0,,instrument-uid' })),
        /Expected '--instrument-id' as comma-separated list/
      );
    });
  });

  describe('parseLastPricesRequest', () => {
    test('returns generated getLastPrices request', () => {
      const request = parseLastPricesRequest(rawOptions({
        'instrument-id': 'BBG00QPYJ5H0,instrument-uid'
      }));

      assert.deepEqual(request.figi, []);
      assert.deepEqual(request.instrumentId, ['BBG00QPYJ5H0', 'instrument-uid']);
    });
  });

  describe('parseLastPricesFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseLastPricesFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseLastPricesFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createLastPricesCommand', () => {
    test('calls getLastPrices and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetLastPricesRequest | undefined;
      let closeCalls = 0;
      const command = createLastPricesCommand((options) => {
        receivedOptions = options;

        return {
          marketdata: {
            async getLastPrices(request) {
              receivedRequest = request;

              return lastPricesResponse();
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
          'marketdata',
          'get-last-prices',
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
      assert.deepEqual(receivedRequest?.figi, []);
      assert.deepEqual(receivedRequest?.instrumentId, ['BBG00QPYJ5H0', 'instrument-uid']);
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].figi, 'BBG00QPYJ5H0');
    });

    test('closes sdk when getLastPrices rejects', async () => {
      let closeCalls = 0;
      const command = createLastPricesCommand(() => ({
        marketdata: {
          async getLastPrices() {
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
            'marketdata',
            'get-last-prices',
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
