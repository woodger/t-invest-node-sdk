/**
 * Модуль CLI-репортинга команды `marketdata get-close-prices`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { ClosePricesReport, ClosePricesReportPrice } from '../../../application/reports';
import type { Quotation } from '../../../generated/common';
import type { InstrumentClosePriceResponse } from '../../../generated/marketdata';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const closePricesFormats = ['json', 'table'] as const;

export type ClosePricesFormat = typeof closePricesFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function formatQuotation(value: Quotation | undefined): string {
  if (value === undefined) {
    return '';
  }

  return String(value.units + value.nano / 1e9);
}

function toReportPrice(price: InstrumentClosePriceResponse): ClosePricesReportPrice {
  return {
    figi: price.figi,
    instrumentUid: price.instrumentUid,
    price: formatQuotation(price.price),
    time: formatDate(price.time)
  };
}

export function createClosePricesReport(
  prices: InstrumentClosePriceResponse[]
): ClosePricesReport {
  return prices.map(toReportPrice);
}

export function formatClosePricesReport(
  report: ClosePricesReport,
  format: ClosePricesFormat
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

export function formatClosePrices(
  prices: InstrumentClosePriceResponse[],
  format: ClosePricesFormat
): string {
  return formatClosePricesReport(createClosePricesReport(prices), format);
}
