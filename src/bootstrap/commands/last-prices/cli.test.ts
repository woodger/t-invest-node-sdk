import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { Quotation } from '../../../generated/common';
import {
  GetLastPricesRequest,
  type GetLastPricesResponse,
  type LastPrice
} from '../../../generated/marketdata';
import { createLastPricesCommand, createLastPricesRequest } from './cli';

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
  } as LastPrice;
}

function lastPricesResponse(
  overrides: Partial<GetLastPricesResponse> = {}
): GetLastPricesResponse {
  return {
    lastPrices: [lastPrice()],
    ...overrides
  } as GetLastPricesResponse;
}

describe('last-prices command', () => {
  describe('createLastPricesRequest', () => {
    test('returns generated getLastPrices request', () => {
      const request = createLastPricesRequest({
        'instrument-id': 'BBG00QPYJ5H0,instrument-uid'
      });

      assert.deepEqual(request.instrumentId, ['BBG00QPYJ5H0', 'instrument-uid']);
      assert.doesNotMatch(
        JSON.stringify(GetLastPricesRequest.toJSON(request)),
        /"figi":/
      );
    });
  });

  describe('createLastPricesCommand', () => {
    test('calls getLastPrices and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: GetLastPricesRequest | undefined;
      let closeCalls = 0;
      const command = createLastPricesCommand((options) => {
        receivedOptions = options;

        return {
    marketData: {
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

      const output = await commandFacade.run(
        command,
        [
          'market',
          'last-prices',
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
      assert.deepEqual(receivedRequest?.instrumentId, ['BBG00QPYJ5H0', 'instrument-uid']);
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].figi, 'BBG00QPYJ5H0');
    });

    test('closes sdk when getLastPrices rejects', async () => {
      let closeCalls = 0;
      const command = createLastPricesCommand(() => ({
    marketData: {
          async getLastPrices() {
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
            'market',
            'last-prices',
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
