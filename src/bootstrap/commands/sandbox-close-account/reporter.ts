/**
 * Модуль CLI-репортинга команды `sandbox close-sandbox-account`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и presentation formatting.
 * Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { CloseSandboxAccountReport } from '../../../application/reports';
import { renderJson, renderTextTable } from 'icore';

export const closeSandboxAccountFormats = ['json', 'table'] as const;

export type CloseSandboxAccountFormat = typeof closeSandboxAccountFormats[number];

export function createCloseSandboxAccountReport(accountId: string): CloseSandboxAccountReport {
  return {
    accountId,
    status: 'closed'
  };
}

export function formatCloseSandboxAccountReport(
  report: CloseSandboxAccountReport,
  format: CloseSandboxAccountFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['accountId', 'status'],
    [report.accountId, report.status]
  ]);
}

export function formatCloseSandboxAccount(
  accountId: string,
  format: CloseSandboxAccountFormat
): string {
  return formatCloseSandboxAccountReport(createCloseSandboxAccountReport(accountId), format);
}
