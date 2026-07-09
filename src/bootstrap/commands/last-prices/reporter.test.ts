import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { Quotation } from '../../../generated/t_tech/invest/grpc/common';
import type { LastPrice } from '../../../generated/t_tech/invest/grpc/marketdata';
import { createLastPricesReport, formatLastPricesReport } from './reporter';

function quotation(units: number, nano: number): Quotation {
  return {
    units,
    nano
  };
}

function lastPrice(overrides: Partial<LastPrice> = {}): LastPrice {
  return {
    figi: 'BBG00QPYJ5H0',
    price: quotation(123, 450000000),
    time: new Date('2026-06-19T10:00:00.000Z'),
    instrumentUid: 'instrument-uid',
    ...overrides
  } as LastPrice;
}

describe('last-prices reporter', () => {
  describe('createLastPricesReport', () => {
    test('maps generated last price fields to stable report values', () => {
      const report = createLastPricesReport([lastPrice()]);

      assert.deepEqual(report[0], {
        figi: 'BBG00QPYJ5H0',
        instrumentUid: 'instrument-uid',
        price: '123.45',
        time: '2026-06-19T10:00:00.000Z'
      });
    });

    test('maps missing optional values to empty strings', () => {
      const report = createLastPricesReport([
        lastPrice({
          price: undefined,
          time: undefined
        })
      ]);

      assert.equal(report.at(0)?.price, '');
      assert.equal(report.at(0)?.time, '');
    });
  });

  describe('formatLastPricesReport', () => {
    test('formats report as table', () => {
      const output = formatLastPricesReport(createLastPricesReport([lastPrice()]), 'table');

      assert.match(output, /^figi\s+instrumentUid\s+price\s+time/m);
      assert.match(output, /BBG00QPYJ5H0\s+instrument-uid\s+123.45\s+2026-06-19T10:00:00.000Z/);
    });

    test('formats report as json', () => {
      const output = formatLastPricesReport(createLastPricesReport([lastPrice()]), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].figi, 'BBG00QPYJ5H0');
      assert.equal(parsed[0].instrumentUid, 'instrument-uid');
      assert.equal(parsed[0].price, '123.45');
      assert.equal(parsed[0].time, '2026-06-19T10:00:00.000Z');
    });
  });
});
