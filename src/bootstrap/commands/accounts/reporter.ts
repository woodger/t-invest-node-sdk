/**
 * Модуль CLI-репортинга команды `users get-accounts`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { AccountsReport, AccountsReportAccount } from '../../../application/reports';
import {
  accessLevelToJSON,
  accountStatusToJSON,
  accountTypeToJSON,
  type Account
} from '../../../generated/users';
import {
  formatReportDate
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const accountsFormats = ['json', 'table'] as const;

export type AccountsFormat = typeof accountsFormats[number];

function toReportAccount(account: Account): AccountsReportAccount {
  return {
    id: account.id,
    name: account.name,
    type: accountTypeToJSON(account.type),
    status: accountStatusToJSON(account.status),
    accessLevel: accessLevelToJSON(account.accessLevel),
    openedDate: formatReportDate(account.openedDate),
    closedDate: formatReportDate(account.closedDate)
  };
}

export function createAccountsReport(accounts: Account[]): AccountsReport {
  return accounts.map(toReportAccount);
}

export function formatAccountsReport(report: AccountsReport, format: AccountsFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['id', 'name', 'type', 'status', 'accessLevel', 'openedDate', 'closedDate'],
    ...report.map((account) => [
      account.id,
      account.name,
      account.type,
      account.status,
      account.accessLevel,
      account.openedDate,
      account.closedDate
    ])
  ]);
}

export function formatAccounts(accounts: Account[], format: AccountsFormat): string {
  return formatAccountsReport(createAccountsReport(accounts), format);
}
