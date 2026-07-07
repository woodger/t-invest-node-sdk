import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { Quotation } from '../../../generated/common';
import type {
  GetOrderBookRequest,
  GetOrderBookResponse,
  Order
} from '../../../generated/marketdata';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createOrderBookCommand,
  parseOrderBookDepth,
  parseOrderBookFormat,
  createOrderBookRequest
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

function order(overrides: Partial<Order> = {}): Order {
  return {
    price: quotation(100, 250000000),
    quantity: 10,
    ...overrides
  };
}

function orderBookResponse(
  overrides: Partial<GetOrderBookResponse> = {}
): GetOrderBookResponse {
  return {
    figi: 'BBG00QPYJ5H0',
    depth: 10,
    bids: [order()],
    asks: [order({ price: quotation(101, 0), quantity: 4 })],
    lastPrice: quotation(100, 500000000),
    closePrice: quotation(99, 0),
    limitUp: quotation(120, 0),
    limitDown: quotation(80, 0),
    lastPriceTs: new Date('2026-06-19T10:00:00.000Z'),
    closePriceTs: new Date('2026-06-19T09:00:00.000Z'),
    orderbookTs: new Date('2026-06-19T10:01:00.000Z'),
    instrumentUid: 'instrument-uid',
    ...overrides
  };
}

describe('order-book command', () => {
  describe('parseOrderBookDepth', () => {
    test('returns positive integer depth', () => {
      assert.equal(parseOrderBookDepth(rawOptions({ depth: '10' })), 10);
    });

    test('rejects non-positive or non-integer depth', () => {
      assert.throws(
        () => parseOrderBookDepth(rawOptions({ depth: '0' })),
        /Expected '--depth' as positive integer/
      );
      assert.throws(
        () => parseOrderBookDepth(rawOptions({ depth: '1.5' })),
        /Expected '--depth' as positive integer/
      );
      assert.throws(
        () => parseOrderBookDepth(rawOptions({ depth: '1e2' })),
        /Expected '--depth' as positive integer/
      );
    });
  });

  describe('createOrderBookRequest', () => {
    test('returns generated getOrderBook request', () => {
      const request = createOrderBookRequest({
        'instrument-id': 'BBG00QPYJ5H0',
        depth: 10
      });

      assert.deepEqual(request, {
        figi: '',
        instrumentId: 'BBG00QPYJ5H0',
        depth: 10
      });
    });
  });

  describe('parseOrderBookFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseOrderBookFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseOrderBookFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createOrderBookCommand', () => {
    test('calls getOrderBook and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetOrderBookRequest | undefined;
      let closeCalls = 0;
      const command = createOrderBookCommand((options) => {
        receivedOptions = options;

        return {
          marketdata: {
            async getOrderBook(request) {
              receivedRequest = request;

              return orderBookResponse();
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
          'get-order-book',
          '--token=token',
          '--endpoint=localhost:50051',
          '--instrument-id=BBG00QPYJ5H0',
          '--depth=10',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        figi: '',
        instrumentId: 'BBG00QPYJ5H0',
        depth: 10
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).instrumentUid, 'instrument-uid');
    });

    test('closes sdk when getOrderBook rejects', async () => {
      let closeCalls = 0;
      const command = createOrderBookCommand(() => ({
        marketdata: {
          async getOrderBook() {
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
            'get-order-book',
            '--token=token',
            '--endpoint=localhost:50051',
            '--instrument-id=BBG00QPYJ5H0',
            '--depth=10'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
