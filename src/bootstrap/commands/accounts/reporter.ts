/**
 * Модуль CLI-репортинга команды `accounts`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { AccountsReport, AccountsReportAccount } from '../../../application/reports';
import {
  accessLevelToJSON,
  accountStatusToJSON,
  accountTypeToJSON,
  type Account
} from '../../../generated/users';

export const accountsFormats = ['json', 'table'] as const;

export type AccountsFormat = typeof accountsFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function toReportAccount(account: Account): AccountsReportAccount {
  return {
    id: account.id,
    name: account.name,
    type: accountTypeToJSON(account.type),
    status: accountStatusToJSON(account.status),
    accessLevel: accessLevelToJSON(account.accessLevel),
    openedDate: formatDate(account.openedDate),
    closedDate: formatDate(account.closedDate)
  };
}

function renderTable(rows: string[][]): string {
  const widths = rows[0].map((_, columnIndex) =>
    Math.max(...rows.map((row) => row[columnIndex].length))
  );

  return [
    ...rows.map((row) =>
      row
        .map((value, columnIndex) => value.padEnd(widths[columnIndex]))
        .join('  ')
        .trimEnd()
    ),
    ''
  ].join('\n');
}

export function createAccountsReport(accounts: Account[]): AccountsReport {
  return accounts.map(toReportAccount);
}

export function formatAccountsReport(report: AccountsReport, format: AccountsFormat): string {
  if (format === 'json') {
    return `${JSON.stringify(report, null, 2)}\n`;
  }

  return renderTable([
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
