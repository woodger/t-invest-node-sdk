/**
 * Модуль CLI-репортинга команды `operations get-withdraw-limits`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type {
  WithdrawLimitsReport,
  WithdrawLimitsReportMoney
} from '../../../application/reports';
import type { MoneyValue } from '../../../generated/common';
import type { WithdrawLimitsResponse } from '../../../generated/operations';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const withdrawLimitsFormats = ['json', 'table'] as const;

export type WithdrawLimitsFormat = typeof withdrawLimitsFormats[number];

function formatDecimal(value: MoneyValue): string {
  return String(value.units + value.nano / 1e9);
}

function toReportMoney(value: MoneyValue): WithdrawLimitsReportMoney {
  return {
    currency: value.currency,
    amount: formatDecimal(value)
  };
}

export function createWithdrawLimitsReport(
  response: WithdrawLimitsResponse
): WithdrawLimitsReport {
  return {
    money: response.money.map(toReportMoney),
    blocked: response.blocked.map(toReportMoney),
    blockedGuarantee: response.blockedGuarantee.map(toReportMoney)
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
