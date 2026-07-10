import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { Quotation } from '../../../generated/common';
import type { InstrumentClosePriceResponse } from '../../../generated/marketdata';
import { createClosePricesReport, formatClosePricesReport } from './reporter';

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
    price: quotation(123, 450000000),
    time: new Date('2026-06-19T00:00:00.000Z'),
    ...overrides
  } as InstrumentClosePriceResponse;
}

describe('close-prices reporter', () => {
  describe('createClosePricesReport', () => {
    test('maps generated close price fields to stable report values', () => {
      const report = createClosePricesReport([closePrice()]);

      assert.deepEqual(report[0], {
        figi: 'BBG00QPYJ5H0',
        instrumentUid: 'instrument-uid',
        price: '123.45',
        time: '2026-06-19T00:00:00.000Z'
      });
    });

    test('maps missing optional values to empty strings', () => {
      const report = createClosePricesReport([
        closePrice({
          price: undefined,
          time: undefined
        })
      ]);

      assert.equal(report.at(0)?.price, '');
      assert.equal(report.at(0)?.time, '');
    });
  });

  describe('formatClosePricesReport', () => {
    test('formats report as table', () => {
      const output = formatClosePricesReport(createClosePricesReport([closePrice()]), 'table');

      assert.match(output, /^figi\s+instrumentUid\s+price\s+time/m);
      assert.match(output, /BBG00QPYJ5H0\s+instrument-uid\s+123.45\s+2026-06-19T00:00:00.000Z/);
    });

    test('formats report as json', () => {
      const output = formatClosePricesReport(createClosePricesReport([closePrice()]), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].figi, 'BBG00QPYJ5H0');
      assert.equal(parsed[0].instrumentUid, 'instrument-uid');
      assert.equal(parsed[0].price, '123.45');
      assert.equal(parsed[0].time, '2026-06-19T00:00:00.000Z');
    });
  });
});
