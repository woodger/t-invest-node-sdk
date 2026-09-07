import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { MoneyValue, Quotation } from '../generated/common';
import {
  formatReportDate,
  formatReportDecimal,
  formatReportMoneyText,
  formatReportQuotation,
  toReportMoney
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

    test('preserves nanos when units exceed precise floating-point range', () => {
      assert.equal(
        formatReportDecimal({ units: 100_000_000, nano: 1 }),
        '100000000.000000001'
      );
    });

    test('uses fixed decimal notation for sub-unit values', () => {
      assert.equal(formatReportDecimal({ units: 0, nano: 1 }), '0.000000001');
    });

    test('formats negative and mixed-sign values by their exact total nanos', () => {
      assert.equal(formatReportDecimal({ units: -10, nano: -250_000_000 }), '-10.25');
      assert.equal(formatReportDecimal({ units: 1, nano: -500_000_000 }), '0.5');
    });

    test('returns an empty string for missing values', () => {
      assert.equal(formatReportDecimal(undefined), '');
    });
  });

  describe('toReportMoney', () => {
    test('maps money amount and currency to a report value', () => {
      const value: MoneyValue = {
        currency: 'rub',
        units: 100,
        nano: 500_000_000
      };

      assert.deepEqual(toReportMoney(value), {
        currency: 'rub',
        amount: '100.5'
      });
    });

    test('returns null for missing values', () => {
      assert.equal(toReportMoney(undefined), null);
    });
  });

  describe('formatReportMoneyText', () => {
    test('formats money text with currency when currency is present', () => {
      assert.equal(formatReportMoneyText({
        currency: 'rub',
        amount: '100.5'
      }), '100.5 rub');
    });

    test('formats only amount when currency is empty', () => {
      const value: MoneyValue = {
        currency: '',
        units: 100,
        nano: 500_000_000
      };

      assert.equal(formatReportMoneyText(toReportMoney(value)), '100.5');
    });

    test('returns an empty string for missing values', () => {
      assert.equal(formatReportMoneyText(null), '');
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
