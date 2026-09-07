import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { MoneyValue, Quotation } from '../../../generated/common';
import type { PortfolioPosition, PortfolioResponse } from '../../../generated/operations';
import { createPortfolioReport, formatPortfolioReport } from './reporter';

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function quotation(units: number, nano: number): Quotation {
  return {
    units,
    nano
  };
}

function position(overrides: Partial<PortfolioPosition> = {}): PortfolioPosition {
  return {
    figi: 'BBG00QPYJ5H0',
    instrumentType: 'share',
    quantity: quotation(2, 500000000),
    averagePositionPrice: money(100, 250000000),
    expectedYield: quotation(12, 500000000),
    currentNkd: undefined,
    currentPrice: money(105, 750000000),
    averagePositionPriceFifo: undefined,
    blocked: false,
    blockedLots: undefined,
    positionUid: 'position-uid',
    instrumentUid: 'instrument-uid',
    varMargin: undefined,
    expectedYieldFifo: undefined,
    ...overrides
  } as PortfolioPosition;
}

function portfolio(overrides: Partial<PortfolioResponse> = {}): PortfolioResponse {
  return {
    totalAmountShares: money(1000, 0),
    totalAmountBonds: money(200, 0),
    totalAmountEtf: money(300, 0),
    totalAmountCurrencies: money(400, 0),
    totalAmountFutures: money(500, 0),
    expectedYield: quotation(15, 250000000),
    positions: [position()],
    accountId: 'account-id',
    totalAmountOptions: money(600, 0),
    totalAmountSp: money(700, 0),
    totalAmountPortfolio: money(3700, 500000000),
    virtualPositions: [],
    ...overrides
  } as PortfolioResponse;
}

describe('portfolio reporter', () => {
  describe('createPortfolioReport', () => {
    test('maps generated portfolio fields to stable report values', () => {
      const report = createPortfolioReport(portfolio());

      assert.deepEqual(report.summary, {
        accountId: 'account-id',
        totalAmountPortfolio: {
          currency: 'rub',
          amount: '3700.5'
        },
        totalAmountShares: {
          currency: 'rub',
          amount: '1000'
        },
        totalAmountBonds: {
          currency: 'rub',
          amount: '200'
        },
        totalAmountEtf: {
          currency: 'rub',
          amount: '300'
        },
        totalAmountCurrencies: {
          currency: 'rub',
          amount: '400'
        },
        totalAmountFutures: {
          currency: 'rub',
          amount: '500'
        },
        totalAmountOptions: {
          currency: 'rub',
          amount: '600'
        },
        totalAmountSp: {
          currency: 'rub',
          amount: '700'
        },
        expectedYield: '15.25'
      });
      assert.deepEqual(report.positions[0], {
        figi: 'BBG00QPYJ5H0',
        instrumentUid: 'instrument-uid',
        positionUid: 'position-uid',
        instrumentType: 'share',
        quantity: '2.5',
        averagePositionPrice: {
          currency: 'rub',
          amount: '100.25'
        },
        currentPrice: {
          currency: 'rub',
          amount: '105.75'
        },
        expectedYield: '12.5',
        blocked: false
      });
    });
  });

  describe('formatPortfolioReport', () => {
    test('formats report as table', () => {
      const output = formatPortfolioReport(createPortfolioReport(portfolio()), 'table');

      assert.match(output, /accountId: account-id/);
      assert.match(output, /totalAmountPortfolio: 3700.5 rub/);
      assert.match(output, /^figi\s+instrumentUid\s+positionUid\s+instrumentType/m);
      assert.match(output, /BBG00QPYJ5H0\s+instrument-uid\s+position-uid\s+share/);
    });

    test('formats report as json', () => {
      const report = createPortfolioReport(portfolio());
      const output = formatPortfolioReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });
  });
});
