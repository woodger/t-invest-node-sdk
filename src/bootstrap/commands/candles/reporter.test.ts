import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { HistoricCandle } from '../../../generated/marketdata';
import { createCandlesReport, formatCandlesReport } from './reporter';

function candle(overrides: Partial<HistoricCandle> = {}): HistoricCandle {
  return {
    open: { units: 10, nano: 500000000 },
    high: { units: 11, nano: 0 },
    low: { units: 9, nano: 250000000 },
    close: { units: 10, nano: 750000000 },
    volume: 42,
    time: new Date('2026-06-19T00:00:00.000Z'),
    isComplete: true,
    ...overrides
  } as HistoricCandle;
}

describe('candles reporter', () => {
  describe('createCandlesReport', () => {
    test('maps generated candle fields to stable report values', () => {
      const report = createCandlesReport([candle()]);

      assert.deepEqual(report[0], {
        time: '2026-06-19T00:00:00.000Z',
        open: '10.5',
        high: '11',
        low: '9.25',
        close: '10.75',
        volume: 42,
        isComplete: true
      });
    });
  });

  describe('formatCandlesReport', () => {
    test('formats report as json', () => {
      const output = formatCandlesReport(createCandlesReport([candle()]), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].time, '2026-06-19T00:00:00.000Z');
      assert.equal(parsed[0].open, '10.5');
      assert.equal(parsed[0].high, '11');
      assert.equal(parsed[0].low, '9.25');
      assert.equal(parsed[0].close, '10.75');
      assert.equal(parsed[0].volume, 42);
      assert.equal(parsed[0].isComplete, true);
    });

    test('formats report as csv', () => {
      const output = formatCandlesReport(createCandlesReport([candle()]), 'csv');

      assert.match(output, /^time,open,high,low,close,volume,isComplete/);
      assert.match(output, /2026-06-19T00:00:00.000Z,10.5,11,9.25,10.75,42,true/);
    });
  });
});
