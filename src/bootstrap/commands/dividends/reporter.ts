/**
 * Модуль CLI-репортинга команды `instruments get-dividends`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { DividendsReport, DividendsReportItem } from '../../../application/reports';
import type { MoneyValue, Quotation } from '../../../generated/common';
import type { Dividend } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const dividendsFormats = ['json', 'table'] as const;

export type DividendsFormat = typeof dividendsFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function formatDecimal(value: MoneyValue | Quotation | undefined): string {
  if (value === undefined) {
    return '';
  }

  return String(value.units + value.nano / 1e9);
}

function formatMoney(value: MoneyValue | undefined): string {
  if (value === undefined) {
    return '';
  }

  const amount = formatDecimal(value);

  return value.currency === '' ? amount : `${amount} ${value.currency}`;
}

function formatQuotation(value: Quotation | undefined): string {
  return formatDecimal(value);
}

function toReportDividend(dividend: Dividend): DividendsReportItem {
  return {
    dividendNet: formatMoney(dividend.dividendNet),
    paymentDate: formatDate(dividend.paymentDate),
    declaredDate: formatDate(dividend.declaredDate),
    lastBuyDate: formatDate(dividend.lastBuyDate),
    dividendType: dividend.dividendType,
    recordDate: formatDate(dividend.recordDate),
    regularity: dividend.regularity,
    closePrice: formatMoney(dividend.closePrice),
    yieldValue: formatQuotation(dividend.yieldValue),
    createdAt: formatDate(dividend.createdAt)
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
      dividend.dividendNet,
      dividend.closePrice,
      dividend.yieldValue,
      dividend.dividendType,
      dividend.regularity
    ])
  ]);
}

export function formatDividends(dividends: Dividend[], format: DividendsFormat): string {
  return formatDividendsReport(createDividendsReport(dividends), format);
}
