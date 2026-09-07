import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  AccessLevel,
  AccountStatus,
  AccountType,
  type Account
} from '../../../generated/users';
import { createAccountsReport, formatAccountsReport } from './reporter';

function account(overrides: Partial<Account> = {}): Account {
  return {
    id: 'account-id',
    name: 'Main account',
    type: AccountType.ACCOUNT_TYPE_TINKOFF,
    status: AccountStatus.ACCOUNT_STATUS_OPEN,
    openedDate: new Date('2026-06-19T00:00:00.000Z'),
    closedDate: undefined,
    accessLevel: AccessLevel.ACCOUNT_ACCESS_LEVEL_FULL_ACCESS,
    ...overrides
  } as Account;
}

describe('accounts reporter', () => {
  describe('createAccountsReport', () => {
    test('maps generated account fields to stable report values', () => {
      const report = createAccountsReport([account()]);

      assert.deepEqual(report[0], {
        id: 'account-id',
        name: 'Main account',
        type: 'ACCOUNT_TYPE_TINKOFF',
        status: 'ACCOUNT_STATUS_OPEN',
        accessLevel: 'ACCOUNT_ACCESS_LEVEL_FULL_ACCESS',
        openedDate: '2026-06-19T00:00:00.000Z',
        closedDate: ''
      });
    });
  });

  describe('formatAccountsReport', () => {
    test('formats report as table', () => {
      const output = formatAccountsReport(createAccountsReport([account()]), 'table');

      assert.match(output, /^id\s+name\s+type\s+status\s+accessLevel\s+openedDate\s+closedDate/);
      assert.match(output, /account-id\s+Main account\s+ACCOUNT_TYPE_TINKOFF/);
      assert.match(output, /ACCOUNT_ACCESS_LEVEL_FULL_ACCESS/);
    });

    test('formats report as json', () => {
      const report = createAccountsReport([account()]);
      const output = formatAccountsReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });
  });
});
