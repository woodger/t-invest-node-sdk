/**
 * Модуль CLI-репортинга команды `instruments get-futures-margin`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { FuturesMarginReport } from '../../../application/reports';
import type { MoneyValue, Quotation } from '../../../generated/common';
import type { GetFuturesMarginResponse } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const futuresMarginFormats = ['json', 'table'] as const;

export type FuturesMarginFormat = typeof futuresMarginFormats[number];

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

export function createFuturesMarginReport(response: GetFuturesMarginResponse): FuturesMarginReport {
  return {
    initialMarginOnBuy: formatMoney(response.initialMarginOnBuy),
    initialMarginOnSell: formatMoney(response.initialMarginOnSell),
    minPriceIncrement: formatDecimal(response.minPriceIncrement),
    minPriceIncrementAmount: formatDecimal(response.minPriceIncrementAmount)
  };
}

export function formatFuturesMarginReport(
  report: FuturesMarginReport,
  format: FuturesMarginFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['initialMarginOnBuy', 'initialMarginOnSell', 'minPriceIncrement', 'minPriceIncrementAmount'],
    [
      report.initialMarginOnBuy,
      report.initialMarginOnSell,
      report.minPriceIncrement,
      report.minPriceIncrementAmount
    ]
  ]);
}

export function formatFuturesMargin(
  response: GetFuturesMarginResponse,
  format: FuturesMarginFormat
): string {
  return formatFuturesMarginReport(createFuturesMarginReport(response), format);
}
