import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { MoneyValue } from '../../../generated/common';
import type {
  PositionsFutures,
  PositionsOptions,
  PositionsResponse,
  PositionsSecurities
} from '../../../generated/operations';
import { createPositionsReport, formatPositionsReport } from './reporter';

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function security(overrides: Partial<PositionsSecurities> = {}): PositionsSecurities {
  return {
    figi: 'BBG00QPYJ5H0',
    blocked: 1,
    balance: 10,
    positionUid: 'security-position-uid',
    instrumentUid: 'security-instrument-uid',
    exchangeBlocked: false,
    instrumentType: 'share',
    ...overrides
  };
}

function future(overrides: Partial<PositionsFutures> = {}): PositionsFutures {
  return {
    figi: 'FUTFIGI',
    blocked: 2,
    balance: 3,
    positionUid: 'future-position-uid',
    instrumentUid: 'future-instrument-uid',
    ...overrides
  };
}

function option(overrides: Partial<PositionsOptions> = {}): PositionsOptions {
  return {
    blocked: 4,
    balance: 5,
    positionUid: 'option-position-uid',
    instrumentUid: 'option-instrument-uid',
    ...overrides
  };
}

function positions(overrides: Partial<PositionsResponse> = {}): PositionsResponse {
  return {
    money: [money(100, 500000000)],
    blocked: [money(10, 250000000, 'usd')],
    securities: [security()],
    limitsLoadingInProgress: false,
    futures: [future()],
    options: [option()],
    ...overrides
  };
}

describe('positions reporter', () => {
  describe('createPositionsReport', () => {
    test('maps generated positions fields to stable report values', () => {
      const report = createPositionsReport(positions());

      assert.deepEqual(report.money[0], {
        currency: 'rub',
        amount: '100.5'
      });
      assert.deepEqual(report.blocked[0], {
        currency: 'usd',
        amount: '10.25'
      });
      assert.deepEqual(report.securities[0], {
        figi: 'BBG00QPYJ5H0',
        instrumentUid: 'security-instrument-uid',
        positionUid: 'security-position-uid',
        instrumentType: 'share',
        balance: 10,
        blocked: 1,
        exchangeBlocked: false
      });
      assert.deepEqual(report.futures[0], {
        figi: 'FUTFIGI',
        instrumentUid: 'future-instrument-uid',
        positionUid: 'future-position-uid',
        balance: 3,
        blocked: 2
      });
      assert.deepEqual(report.options[0], {
        instrumentUid: 'option-instrument-uid',
        positionUid: 'option-position-uid',
        balance: 5,
        blocked: 4
      });
    });
  });

  describe('formatPositionsReport', () => {
    test('formats report as table sections', () => {
      const output = formatPositionsReport(createPositionsReport(positions()), 'table');

      assert.match(output, /limitsLoadingInProgress: false/);
      assert.match(output, /money:\ncurrency\s+amount\nrub\s+100.5/);
      assert.match(output, /blocked:\ncurrency\s+amount\nusd\s+10.25/);
      assert.match(output, /securities:\nfigi\s+instrumentUid\s+positionUid/);
      assert.match(output, /BBG00QPYJ5H0\s+security-instrument-uid\s+security-position-uid/);
      assert.match(output, /futures:\nfigi\s+instrumentUid\s+positionUid/);
      assert.match(output, /options:\ninstrumentUid\s+positionUid\s+balance\s+blocked/);
    });

    test('formats report as json', () => {
      const output = formatPositionsReport(createPositionsReport(positions()), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed.limitsLoadingInProgress, false);
      assert.equal(parsed.money[0].currency, 'rub');
      assert.equal(parsed.money[0].amount, '100.5');
      assert.equal(parsed.blocked[0].amount, '10.25');
      assert.equal(parsed.securities[0].instrumentType, 'share');
      assert.equal(parsed.futures[0].figi, 'FUTFIGI');
      assert.equal(parsed.options[0].balance, 5);
    });
  });
});
