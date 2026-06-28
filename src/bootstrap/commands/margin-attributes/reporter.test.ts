import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { MoneyValue, Quotation } from '../../../generated/common';
import type { GetMarginAttributesResponse } from '../../../generated/users';
import { createMarginAttributesReport, formatMarginAttributesReport } from './reporter';

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

function response(
  overrides: Partial<GetMarginAttributesResponse> = {}
): GetMarginAttributesResponse {
  return {
    liquidPortfolio: money(1000, 0),
    startingMargin: money(200, 0),
    minimalMargin: money(100, 0),
    fundsSufficiencyLevel: quotation(5, 500000000),
    amountOfMissingFunds: money(0, 0),
    correctedMargin: money(250, 250000000),
    ...overrides
  };
}

describe('margin-attributes reporter', () => {
  describe('createMarginAttributesReport', () => {
    test('maps generated margin attributes to stable report values', () => {
      const report = createMarginAttributesReport(response());

      assert.deepEqual(report, {
        liquidPortfolio: {
          currency: 'rub',
          amount: '1000'
        },
        startingMargin: {
          currency: 'rub',
          amount: '200'
        },
        minimalMargin: {
          currency: 'rub',
          amount: '100'
        },
        fundsSufficiencyLevel: '5.5',
        amountOfMissingFunds: {
          currency: 'rub',
          amount: '0'
        },
        correctedMargin: {
          currency: 'rub',
          amount: '250.25'
        }
      });
    });

    test('maps missing optional values to nulls and empty strings', () => {
      const report = createMarginAttributesReport(response({
        liquidPortfolio: undefined,
        startingMargin: undefined,
        minimalMargin: undefined,
        fundsSufficiencyLevel: undefined,
        amountOfMissingFunds: undefined,
        correctedMargin: undefined
      }));

      assert.deepEqual(report, {
        liquidPortfolio: null,
        startingMargin: null,
        minimalMargin: null,
        fundsSufficiencyLevel: '',
        amountOfMissingFunds: null,
        correctedMargin: null
      });
    });
  });

  describe('formatMarginAttributesReport', () => {
    test('formats report as table', () => {
      const output = formatMarginAttributesReport(createMarginAttributesReport(response()), 'table');

      assert.match(
        output,
        /^liquidPortfolio\s+startingMargin\s+minimalMargin\s+fundsSufficiencyLevel\s+amountOfMissingFunds\s+correctedMargin/m
      );
      assert.match(output, /1000 rub\s+200 rub\s+100 rub\s+5.5\s+0 rub\s+250.25 rub/);
    });

    test('formats report as json', () => {
      const output = formatMarginAttributesReport(createMarginAttributesReport(response()), 'json');
      const parsed = JSON.parse(output);

      assert.deepEqual(parsed.liquidPortfolio, {
        currency: 'rub',
        amount: '1000'
      });
      assert.deepEqual(parsed.startingMargin, {
        currency: 'rub',
        amount: '200'
      });
      assert.deepEqual(parsed.minimalMargin, {
        currency: 'rub',
        amount: '100'
      });
      assert.equal(parsed.fundsSufficiencyLevel, '5.5');
      assert.deepEqual(parsed.correctedMargin, {
        currency: 'rub',
        amount: '250.25'
      });
    });
  });
});
