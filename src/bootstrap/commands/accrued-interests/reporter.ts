/**
 * Модуль CLI-репортинга команды `instruments get-accrued-interests`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type {
  AccruedInterestsReport,
  AccruedInterestsReportItem
} from '../../../application/reports';
import type { Quotation } from '../../../generated/common';
import type { AccruedInterest } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const accruedInterestsFormats = ['json', 'table'] as const;

export type AccruedInterestsFormat = typeof accruedInterestsFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function formatQuotation(value: Quotation | undefined): string {
  if (value === undefined) {
    return '';
  }

  return String(value.units + value.nano / 1e9);
}

function toReportAccruedInterest(
  accruedInterest: AccruedInterest
): AccruedInterestsReportItem {
  return {
    date: formatDate(accruedInterest.date),
    value: formatQuotation(accruedInterest.value),
    valuePercent: formatQuotation(accruedInterest.valuePercent),
    nominal: formatQuotation(accruedInterest.nominal)
  };
}

export function createAccruedInterestsReport(
  accruedInterests: AccruedInterest[]
): AccruedInterestsReport {
  return accruedInterests.map(toReportAccruedInterest);
}

export function formatAccruedInterestsReport(
  report: AccruedInterestsReport,
  format: AccruedInterestsFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['date', 'value', 'valuePercent', 'nominal'],
    ...report.map((accruedInterest) => [
      accruedInterest.date,
      accruedInterest.value,
      accruedInterest.valuePercent,
      accruedInterest.nominal
    ])
  ]);
}

export function formatAccruedInterests(
  accruedInterests: AccruedInterest[],
  format: AccruedInterestsFormat
): string {
  return formatAccruedInterestsReport(
    createAccruedInterestsReport(accruedInterests),
    format
  );
}
