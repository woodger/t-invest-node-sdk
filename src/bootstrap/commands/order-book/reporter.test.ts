import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { Quotation } from '../../../generated/common';
import type {
  GetOrderBookResponse,
  Order
} from '../../../generated/marketdata';
import { createOrderBookReport, formatOrderBookReport } from './reporter';

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
  } as Order;
}

function response(overrides: Partial<GetOrderBookResponse> = {}): GetOrderBookResponse {
  return {
    figi: 'BBG00QPYJ5H0',
    depth: 2,
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
  } as GetOrderBookResponse;
}

describe('order-book reporter', () => {
  describe('createOrderBookReport', () => {
    test('maps generated order book fields to stable report values', () => {
      const report = createOrderBookReport(response());

      assert.deepEqual(report, {
        figi: 'BBG00QPYJ5H0',
        instrumentUid: 'instrument-uid',
        depth: 2,
        lastPrice: '100.5',
        closePrice: '99',
        limitUp: '120',
        limitDown: '80',
        lastPriceTime: '2026-06-19T10:00:00.000Z',
        closePriceTime: '2026-06-19T09:00:00.000Z',
        orderBookTime: '2026-06-19T10:01:00.000Z',
        levels: [
          {
            side: 'bid',
            price: '100.25',
            quantity: 10
          },
          {
            side: 'ask',
            price: '101',
            quantity: 4
          }
        ]
      });
    });

    test('maps missing optional values to empty strings', () => {
      const report = createOrderBookReport(response({
        bids: [order({ price: undefined })],
        asks: [],
        lastPrice: undefined,
        closePrice: undefined,
        limitUp: undefined,
        limitDown: undefined,
        lastPriceTs: undefined,
        closePriceTs: undefined,
        orderbookTs: undefined
      }));

      assert.equal(report.lastPrice, '');
      assert.equal(report.closePrice, '');
      assert.equal(report.limitUp, '');
      assert.equal(report.limitDown, '');
      assert.equal(report.lastPriceTime, '');
      assert.equal(report.closePriceTime, '');
      assert.equal(report.orderBookTime, '');
      assert.equal(report.levels.at(0)?.price, '');
    });
  });

  describe('formatOrderBookReport', () => {
    test('formats report as table', () => {
      const output = formatOrderBookReport(createOrderBookReport(response()), 'table');

      assert.match(output, /^figi\s+instrumentUid\s+depth\s+orderBookTime\s+side\s+price\s+quantity/m);
      assert.match(output, /BBG00QPYJ5H0\s+instrument-uid\s+2\s+2026-06-19T10:01:00.000Z\s+bid\s+100.25\s+10/);
      assert.match(output, /BBG00QPYJ5H0\s+instrument-uid\s+2\s+2026-06-19T10:01:00.000Z\s+ask\s+101\s+4/);
    });

    test('formats report as json', () => {
      const report = createOrderBookReport(response());
      const output = formatOrderBookReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });
  });
});
