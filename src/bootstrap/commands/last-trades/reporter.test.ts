import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { Quotation } from '../../../generated/common';
import {
  TradeDirection,
  type Trade
} from '../../../generated/marketdata';
import { createLastTradesReport, formatLastTradesReport } from './reporter';

function quotation(units: number, nano: number): Quotation {
  return {
    units,
    nano
  };
}

function trade(overrides: Partial<Trade> = {}): Trade {
  return {
    figi: 'BBG00QPYJ5H0',
    direction: TradeDirection.TRADE_DIRECTION_BUY,
    price: quotation(123, 450000000),
    quantity: 10,
    time: new Date('2026-06-19T10:00:00.000Z'),
    instrumentUid: 'instrument-uid',
    ...overrides
  };
}

describe('last-trades reporter', () => {
  describe('createLastTradesReport', () => {
    test('maps generated trade fields to stable report values', () => {
      const report = createLastTradesReport([trade()]);

      assert.deepEqual(report[0], {
        figi: 'BBG00QPYJ5H0',
        instrumentUid: 'instrument-uid',
        direction: 'TRADE_DIRECTION_BUY',
        price: '123.45',
        quantity: 10,
        time: '2026-06-19T10:00:00.000Z'
      });
    });

    test('maps missing optional values to empty strings', () => {
      const report = createLastTradesReport([
        trade({
          price: undefined,
          time: undefined
        })
      ]);

      assert.equal(report.at(0)?.price, '');
      assert.equal(report.at(0)?.time, '');
    });
  });

  describe('formatLastTradesReport', () => {
    test('formats report as table', () => {
      const output = formatLastTradesReport(createLastTradesReport([trade()]), 'table');

      assert.match(output, /^figi\s+instrumentUid\s+direction\s+price\s+quantity\s+time/m);
      assert.match(
        output,
        /BBG00QPYJ5H0\s+instrument-uid\s+TRADE_DIRECTION_BUY\s+123.45\s+10\s+2026-06-19T10:00:00.000Z/
      );
    });

    test('formats report as json', () => {
      const output = formatLastTradesReport(createLastTradesReport([trade()]), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].figi, 'BBG00QPYJ5H0');
      assert.equal(parsed[0].instrumentUid, 'instrument-uid');
      assert.equal(parsed[0].direction, 'TRADE_DIRECTION_BUY');
      assert.equal(parsed[0].price, '123.45');
      assert.equal(parsed[0].quantity, 10);
      assert.equal(parsed[0].time, '2026-06-19T10:00:00.000Z');
    });
  });
});
