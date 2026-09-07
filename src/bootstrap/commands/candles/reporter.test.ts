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
      const report = createCandlesReport([candle()]);
      const output = formatCandlesReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });

    test('formats report as csv', () => {
      const output = formatCandlesReport(createCandlesReport([candle()]), 'csv');

      assert.equal(
        output,
        'time,open,high,low,close,volume,isComplete\n'
          + '2026-06-19T00:00:00.000Z,10.5,11,9.25,10.75,42,true\n'
      );
    });

    test('formats an empty report as a header-only csv document', () => {
      assert.equal(
        formatCandlesReport([], 'csv'),
        'time,open,high,low,close,volume,isComplete\n'
      );
    });
  });
});
