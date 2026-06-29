/**
 * Модуль CLI-репортинга команды `sandbox open-sandbox-account`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и presentation formatting.
 * Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { OpenSandboxAccountReport } from '../../../application/reports';
import type { OpenSandboxAccountResponse } from '../../../generated/sandbox';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const openSandboxAccountFormats = ['json', 'table'] as const;

export type OpenSandboxAccountFormat = typeof openSandboxAccountFormats[number];

export function createOpenSandboxAccountReport(
  response: OpenSandboxAccountResponse
): OpenSandboxAccountReport {
  return {
    accountId: response.accountId
  };
}

export function formatOpenSandboxAccountReport(
  report: OpenSandboxAccountReport,
  format: OpenSandboxAccountFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['accountId'],
    [report.accountId]
  ]);
}

export function formatOpenSandboxAccount(
  response: OpenSandboxAccountResponse,
  format: OpenSandboxAccountFormat
): string {
  return formatOpenSandboxAccountReport(createOpenSandboxAccountReport(response), format);
}
