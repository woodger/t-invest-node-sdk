/**
 * Модуль CLI-репортинга команды `sandbox sandbox-pay-in`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и presentation formatting.
 * Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { SandboxPayInReport } from '../../../application/reports';
import type { SandboxPayInResponse } from '../../../generated/sandbox';
import {
  formatReportMoneyText,
  toReportMoney
} from '../../../infrastructure/report-values';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const sandboxPayInFormats = ['json', 'table'] as const;

export type SandboxPayInFormat = typeof sandboxPayInFormats[number];

export function createSandboxPayInReport(response: SandboxPayInResponse): SandboxPayInReport {
  return {
    balance: toReportMoney(response.balance)
  };
}

export function formatSandboxPayInReport(
  report: SandboxPayInReport,
  format: SandboxPayInFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['balance'],
    [formatReportMoneyText(report.balance)]
  ]);
}

export function formatSandboxPayIn(
  response: SandboxPayInResponse,
  format: SandboxPayInFormat
): string {
  return formatSandboxPayInReport(createSandboxPayInReport(response), format);
}
