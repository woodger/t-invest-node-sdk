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
        liquidPortfolio: '1000 rub',
        startingMargin: '200 rub',
        minimalMargin: '100 rub',
        fundsSufficiencyLevel: '5.5',
        amountOfMissingFunds: '0 rub',
        correctedMargin: '250.25 rub'
      });
    });

    test('maps missing optional values to empty strings', () => {
      const report = createMarginAttributesReport(response({
        liquidPortfolio: undefined,
        startingMargin: undefined,
        minimalMargin: undefined,
        fundsSufficiencyLevel: undefined,
        amountOfMissingFunds: undefined,
        correctedMargin: undefined
      }));

      assert.deepEqual(report, {
        liquidPortfolio: '',
        startingMargin: '',
        minimalMargin: '',
        fundsSufficiencyLevel: '',
        amountOfMissingFunds: '',
        correctedMargin: ''
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

      assert.equal(parsed.liquidPortfolio, '1000 rub');
      assert.equal(parsed.startingMargin, '200 rub');
      assert.equal(parsed.minimalMargin, '100 rub');
      assert.equal(parsed.fundsSufficiencyLevel, '5.5');
      assert.equal(parsed.correctedMargin, '250.25 rub');
    });
  });
});
