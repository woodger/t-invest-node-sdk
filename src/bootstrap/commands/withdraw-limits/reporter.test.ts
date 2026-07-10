import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { MoneyValue } from '../../../generated/common';
import type { WithdrawLimitsResponse } from '../../../generated/operations';
import { createWithdrawLimitsReport, formatWithdrawLimitsReport } from './reporter';

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function response(overrides: Partial<WithdrawLimitsResponse> = {}): WithdrawLimitsResponse {
  return {
    money: [money(100, 0)],
    blocked: [money(10, 250000000)],
    blockedGuarantee: [money(1, 500000000)],
    ...overrides
  } as WithdrawLimitsResponse;
}

describe('withdraw-limits reporter', () => {
  describe('createWithdrawLimitsReport', () => {
    test('maps generated withdraw limits fields to stable report values', () => {
      const report = createWithdrawLimitsReport(response());

      assert.deepEqual(report, {
        money: [
          {
            currency: 'rub',
            amount: '100'
          }
        ],
        blocked: [
          {
            currency: 'rub',
            amount: '10.25'
          }
        ],
        blockedGuarantee: [
          {
            currency: 'rub',
            amount: '1.5'
          }
        ]
      });
    });
  });

  describe('formatWithdrawLimitsReport', () => {
    test('formats report as table', () => {
      const output = formatWithdrawLimitsReport(createWithdrawLimitsReport(response()), 'table');

      assert.match(output, /money:/);
      assert.match(output, /blocked:/);
      assert.match(output, /blockedGuarantee:/);
      assert.match(output, /^currency\s+amount/m);
      assert.match(output, /rub\s+100/);
      assert.match(output, /rub\s+10.25/);
      assert.match(output, /rub\s+1.5/);
    });

    test('formats report as json', () => {
      const output = formatWithdrawLimitsReport(createWithdrawLimitsReport(response()), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed.money[0].currency, 'rub');
      assert.equal(parsed.money[0].amount, '100');
      assert.equal(parsed.blocked[0].amount, '10.25');
      assert.equal(parsed.blockedGuarantee[0].amount, '1.5');
    });
  });
});
