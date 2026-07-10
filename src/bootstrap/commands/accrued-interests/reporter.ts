/**
 * Модуль CLI-репортинга команды `instrument bond accrued`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  AccruedInterestsReport,
  AccruedInterestsReportItem
} from '../../../application/reports';
import type { AccruedInterest } from '../../../generated/t_tech/invest/grpc/instruments';
import {
  formatReportDate,
  formatReportQuotation
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const accruedInterestsFormats = ['json', 'table'] as const;

export type AccruedInterestsFormat = typeof accruedInterestsFormats[number];

function toReportAccruedInterest(
  accruedInterest: AccruedInterest
): AccruedInterestsReportItem {
  return {
    date: formatReportDate(accruedInterest.date),
    value: formatReportQuotation(accruedInterest.value),
    valuePercent: formatReportQuotation(accruedInterest.valuePercent),
    nominal: formatReportQuotation(accruedInterest.nominal)
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
