/**
 * Модуль CLI-репортинга команды `instrument future margin`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в
 * `cli.ts`.
 */

import type { FuturesMarginReport } from '../../../application/reports';
import type { GetFuturesMarginResponse } from '../../../generated/instruments';
import {
  formatReportDecimal,
  formatReportMoneyText,
  toReportMoney
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

/** Представление гарантийного обеспечения фьючерса: JSON или таблица. */
export type FuturesMarginFormat = typeof futuresMarginFormats[number];

export const futuresMarginFormats = ['json', 'table'] as const;

export function createFuturesMarginReport(
  response: GetFuturesMarginResponse
): FuturesMarginReport {
  return {
    initialMarginOnBuy: toReportMoney(response.initialMarginOnBuy),
    initialMarginOnSell: toReportMoney(response.initialMarginOnSell),
    minPriceIncrement: formatReportDecimal(response.minPriceIncrement),
    minPriceIncrementAmount: formatReportDecimal(
      response.minPriceIncrementAmount
    )
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
    [
      'initialMarginOnBuy',
      'initialMarginOnSell',
      'minPriceIncrement',
      'minPriceIncrementAmount'
    ],
    [
      formatReportMoneyText(report.initialMarginOnBuy),
      formatReportMoneyText(report.initialMarginOnSell),
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
