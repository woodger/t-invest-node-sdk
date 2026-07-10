import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { Dividend } from '../../../generated/instruments';
import { createDividendsReport, formatDividendsReport } from './reporter';

function dividend(overrides: Partial<Dividend> = {}): Dividend {
  return {
    dividendNet: {
      currency: 'rub',
      units: 12,
      nano: 500_000_000
    },
    paymentDate: new Date('2026-02-01T00:00:00Z'),
    declaredDate: new Date('2026-01-01T00:00:00Z'),
    lastBuyDate: new Date('2026-01-20T00:00:00Z'),
    dividendType: 'Regular Cash',
    recordDate: new Date('2026-01-22T00:00:00Z'),
    regularity: 'Annual',
    closePrice: {
      currency: 'rub',
      units: 100,
      nano: 250_000_000
    },
    yieldValue: {
      units: 5,
      nano: 125_000_000
    },
    createdAt: new Date('2026-01-03T00:00:00Z'),
    ...overrides
  } as Dividend;
}

describe('dividends reporter', () => {
  describe('createDividendsReport', () => {
    test('maps generated dividends to stable report values', () => {
      const report = createDividendsReport([dividend()]);

      assert.deepEqual(report, [
        {
          dividendNet: {
            currency: 'rub',
            amount: '12.5'
          },
          paymentDate: '2026-02-01T00:00:00.000Z',
          declaredDate: '2026-01-01T00:00:00.000Z',
          lastBuyDate: '2026-01-20T00:00:00.000Z',
          dividendType: 'Regular Cash',
          recordDate: '2026-01-22T00:00:00.000Z',
          regularity: 'Annual',
          closePrice: {
            currency: 'rub',
            amount: '100.25'
          },
          yieldValue: '5.125',
          createdAt: '2026-01-03T00:00:00.000Z'
        }
      ]);
    });

    test('maps missing values to nulls and empty strings', () => {
      const report = createDividendsReport([
        dividend({
          dividendNet: undefined,
          paymentDate: undefined,
          declaredDate: undefined,
          lastBuyDate: undefined,
          recordDate: undefined,
          closePrice: undefined,
          yieldValue: undefined,
          createdAt: undefined
        })
      ]);

      assert.equal(report.at(0)?.dividendNet, null);
      assert.equal(report.at(0)?.paymentDate, '');
      assert.equal(report.at(0)?.yieldValue, '');
      assert.equal(report.at(0)?.createdAt, '');
    });
  });

  describe('formatDividendsReport', () => {
    test('formats report as table', () => {
      const output = formatDividendsReport(createDividendsReport([dividend()]), 'table');

      assert.match(output, /^recordDate\s+paymentDate\s+lastBuyDate\s+dividendNet/m);
      assert.match(output, /2026-01-22T00:00:00\.000Z\s+2026-02-01T00:00:00\.000Z/);
      assert.match(output, /12\.5 rub\s+100\.25 rub\s+5\.125\s+Regular Cash\s+Annual/);
    });

    test('formats report as json', () => {
      const output = formatDividendsReport(createDividendsReport([dividend()]), 'json');
      const parsed = JSON.parse(output);

      assert.deepEqual(parsed[0].dividendNet, {
        currency: 'rub',
        amount: '12.5'
      });
      assert.equal(parsed[0].yieldValue, '5.125');
    });
  });
});
