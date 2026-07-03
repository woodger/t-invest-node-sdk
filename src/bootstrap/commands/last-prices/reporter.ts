/**
 * Модуль CLI-репортинга команды `marketdata get-last-prices`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { LastPricesReport, LastPricesReportPrice } from '../../../application/reports';
import type { LastPrice } from '../../../generated/marketdata';
import {
  formatReportDate,
  formatReportQuotation
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const lastPricesFormats = ['json', 'table'] as const;

export type LastPricesFormat = typeof lastPricesFormats[number];

function toReportPrice(price: LastPrice): LastPricesReportPrice {
  return {
    figi: price.figi,
    instrumentUid: price.instrumentUid,
    price: formatReportQuotation(price.price),
    time: formatReportDate(price.time)
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
