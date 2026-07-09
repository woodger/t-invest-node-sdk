import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { AccruedInterest } from '../../../generated/t_tech/invest/grpc/instruments';
import { createAccruedInterestsReport, formatAccruedInterestsReport } from './reporter';

function accruedInterest(overrides: Partial<AccruedInterest> = {}): AccruedInterest {
  return {
    date: new Date('2026-01-02T03:04:05Z'),
    value: {
      units: 10,
      nano: 250_000_000
    },
    valuePercent: {
      units: 5,
      nano: 500_000_000
    },
    nominal: {
      units: 1000,
      nano: 0
    },
    ...overrides
  } as AccruedInterest;
}

describe('accrued-interests reporter', () => {
  describe('createAccruedInterestsReport', () => {
    test('maps generated accrued interests to stable report values', () => {
      const report = createAccruedInterestsReport([accruedInterest()]);

      assert.deepEqual(report, [
        {
          date: '2026-01-02T03:04:05.000Z',
          value: '10.25',
          valuePercent: '5.5',
          nominal: '1000'
        }
      ]);
    });

    test('maps missing values to empty strings', () => {
      const report = createAccruedInterestsReport([
        accruedInterest({
          date: undefined,
          value: undefined,
          valuePercent: undefined,
          nominal: undefined
        })
      ]);

      assert.deepEqual(report[0], {
        date: '',
        value: '',
        valuePercent: '',
        nominal: ''
      });
    });
  });

  describe('formatAccruedInterestsReport', () => {
    test('formats report as table', () => {
      const output = formatAccruedInterestsReport(
        createAccruedInterestsReport([accruedInterest()]),
        'table'
      );

      assert.match(output, /^date\s+value\s+valuePercent\s+nominal/m);
      assert.match(output, /2026-01-02T03:04:05\.000Z\s+10\.25\s+5\.5\s+1000/);
    });

    test('formats report as json', () => {
      const output = formatAccruedInterestsReport(
        createAccruedInterestsReport([accruedInterest()]),
        'json'
      );
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].value, '10.25');
      assert.equal(parsed[0].valuePercent, '5.5');
    });
  });
});
