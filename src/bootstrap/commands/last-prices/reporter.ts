/**
 * Модуль CLI-репортинга команды `last-prices`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { LastPricesReport, LastPricesReportPrice } from '../../../application/reports';
import type { Quotation } from '../../../generated/common';
import type { LastPrice } from '../../../generated/marketdata';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const lastPricesFormats = ['json', 'table'] as const;

export type LastPricesFormat = typeof lastPricesFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function formatQuotation(value: Quotation | undefined): string {
  if (value === undefined) {
    return '';
  }

  return String(value.units + value.nano / 1e9);
}

function toReportPrice(price: LastPrice): LastPricesReportPrice {
  return {
    figi: price.figi,
    instrumentUid: price.instrumentUid,
    price: formatQuotation(price.price),
    time: formatDate(price.time)
  };
}

export function createLastPricesReport(prices: LastPrice[]): LastPricesReport {
  return prices.map(toReportPrice);
}

export function formatLastPricesReport(
  report: LastPricesReport,
  format: LastPricesFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['figi', 'instrumentUid', 'price', 'time'],
    ...report.map((price) => [
      price.figi,
      price.instrumentUid,
      price.price,
      price.time
    ])
  ]);
}

export function formatLastPrices(prices: LastPrice[], format: LastPricesFormat): string {
  return formatLastPricesReport(createLastPricesReport(prices), format);
}
