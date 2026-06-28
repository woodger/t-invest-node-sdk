import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { MoneyValue, Quotation } from '../generated/common';
import {
  formatReportDate,
  formatReportDecimal,
  formatReportMoney,
  formatReportQuotation
} from './report-values';

describe('report values', () => {
  describe('formatReportDate', () => {
    test('returns ISO date strings and empty missing values', () => {
      assert.equal(
        formatReportDate(new Date('2026-06-19T10:00:00.000Z')),
        '2026-06-19T10:00:00.000Z'
      );
      assert.equal(formatReportDate(undefined), '');
    });
  });

  describe('formatReportDecimal', () => {
    test('formats units and nanos as decimal strings', () => {
      assert.equal(formatReportDecimal({ units: 10, nano: 250_000_000 }), '10.25');
      assert.equal(formatReportDecimal({ units: 10, nano: 0 }), '10');
    });

    test('returns an empty string for missing values', () => {
      assert.equal(formatReportDecimal(undefined), '');
    });
  });

  describe('formatReportMoney', () => {
    test('formats money amount with currency when currency is present', () => {
      const value: MoneyValue = {
        currency: 'rub',
        units: 100,
        nano: 500_000_000
      };

      assert.equal(formatReportMoney(value), '100.5 rub');
    });

    test('formats only amount when currency is empty', () => {
      const value: MoneyValue = {
        currency: '',
        units: 100,
        nano: 500_000_000
      };

      assert.equal(formatReportMoney(value), '100.5');
    });

    test('returns an empty string for missing values', () => {
      assert.equal(formatReportMoney(undefined), '');
    });
  });

  describe('formatReportQuotation', () => {
    test('formats quotation values like report decimals', () => {
      const value: Quotation = {
        units: 1,
        nano: 500_000_000
      };

      assert.equal(formatReportQuotation(value), '1.5');
      assert.equal(formatReportQuotation(undefined), '');
    });
  });
});
