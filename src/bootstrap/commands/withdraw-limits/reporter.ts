/**
 * Модуль CLI-репортинга команды `operation withdraw-limits`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  WithdrawLimitsReport
} from '../../../application/reports';
import type { WithdrawLimitsResponse } from '../../../generated/operations';
import {
  toReportMoney
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const withdrawLimitsFormats = ['json', 'table'] as const;

export type WithdrawLimitsFormat = typeof withdrawLimitsFormats[number];

export function createWithdrawLimitsReport(
  response: WithdrawLimitsResponse
): WithdrawLimitsReport {
  return {
    money: response.money.map((value) => toReportMoney(value)),
    blocked: response.blocked.map((value) => toReportMoney(value)),
    blockedGuarantee: response.blockedGuarantee.map((value) => toReportMoney(value))
  };
}

function renderSection(title: string, rows: readonly (readonly string[])[]): string {
  return [
    `${title}:`,
    renderTextTable(rows)
  ].join('\n');
}

export function formatWithdrawLimitsReport(
  report: WithdrawLimitsReport,
  format: WithdrawLimitsFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return [
    renderSection('money', [
      ['currency', 'amount'],
      ...report.money.map((value) => [
        value.currency,
        value.amount
      ])
    ]),
    renderSection('blocked', [
      ['currency', 'amount'],
      ...report.blocked.map((value) => [
        value.currency,
        value.amount
      ])
    ]),
    renderSection('blockedGuarantee', [
      ['currency', 'amount'],
      ...report.blockedGuarantee.map((value) => [
        value.currency,
        value.amount
      ])
    ])
  ].join('\n');
}

export function formatWithdrawLimits(
  response: WithdrawLimitsResponse,
  format: WithdrawLimitsFormat
): string {
  return formatWithdrawLimitsReport(createWithdrawLimitsReport(response), format);
}
