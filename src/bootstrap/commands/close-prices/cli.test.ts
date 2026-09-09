import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { Quotation } from '../../../generated/common';
import type {
  GetClosePricesRequest,
  GetClosePricesResponse,
  InstrumentClosePriceResponse
} from '../../../generated/marketdata';
import { createClosePricesCommand, createClosePricesRequest } from './cli';

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
  } as InstrumentClosePriceResponse;
}

function closePricesResponse(
  overrides: Partial<GetClosePricesResponse> = {}
): GetClosePricesResponse {
  return {
    closePrices: [closePrice()],
    ...overrides
  } as GetClosePricesResponse;
}

describe('close-prices command', () => {
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

  describe('createClosePricesCommand', () => {
    test('calls getClosePrices and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: GetClosePricesRequest | undefined;
      let closeCalls = 0;
      const command = createClosePricesCommand((options) => {
        receivedOptions = options;

        return {
    marketData: {
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
          'market',
          'close-prices',
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
    marketData: {
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
            'market',
            'close-prices',
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
