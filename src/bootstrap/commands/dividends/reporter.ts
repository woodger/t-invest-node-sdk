/**
 * Модуль CLI-репортинга команды `instrument dividends`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { DividendsReport, DividendsReportItem } from '../../../application/reports';
import type { Dividend } from '../../../generated/instruments';
import {
  formatReportDate,
  formatReportMoneyText,
  formatReportQuotation,
  toReportMoney
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const dividendsFormats = ['json', 'table'] as const;

export type DividendsFormat = typeof dividendsFormats[number];

function toReportDividend(dividend: Dividend): DividendsReportItem {
  return {
    dividendNet: toReportMoney(dividend.dividendNet),
    paymentDate: formatReportDate(dividend.paymentDate),
    declaredDate: formatReportDate(dividend.declaredDate),
    lastBuyDate: formatReportDate(dividend.lastBuyDate),
    dividendType: dividend.dividendType,
    recordDate: formatReportDate(dividend.recordDate),
    regularity: dividend.regularity,
    closePrice: toReportMoney(dividend.closePrice),
    yieldValue: formatReportQuotation(dividend.yieldValue),
    createdAt: formatReportDate(dividend.createdAt)
  };
}

export function createDividendsReport(dividends: Dividend[]): DividendsReport {
  return dividends.map(toReportDividend);
}

export function formatDividendsReport(
  report: DividendsReport,
  format: DividendsFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    [
      'recordDate',
      'paymentDate',
      'lastBuyDate',
      'dividendNet',
      'closePrice',
      'yieldValue',
      'dividendType',
      'regularity'
    ],
    ...report.map((dividend) => [
      dividend.recordDate,
      dividend.paymentDate,
      dividend.lastBuyDate,
      formatReportMoneyText(dividend.dividendNet),
      formatReportMoneyText(dividend.closePrice),
      dividend.yieldValue,
      dividend.dividendType,
      dividend.regularity
    ])
  ]);
}

export function formatDividends(dividends: Dividend[], format: DividendsFormat): string {
  return formatDividendsReport(createDividendsReport(dividends), format);
}
