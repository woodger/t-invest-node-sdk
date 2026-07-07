/**
 * Модуль CLI-репортинга команды `market get-trading-status`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { TradingStatusReport } from '../../../application/reports';
import { securityTradingStatusToJSON } from '../../../generated/common';
import type { GetTradingStatusResponse } from '../../../generated/marketdata';
import { renderJson, renderTextTable } from 'icore';

export const tradingStatusFormats = ['json', 'table'] as const;

export type TradingStatusFormat = typeof tradingStatusFormats[number];

export function createTradingStatusReport(response: GetTradingStatusResponse): TradingStatusReport {
  return {
    figi: response.figi,
    instrumentUid: response.instrumentUid,
    tradingStatus: securityTradingStatusToJSON(response.tradingStatus),
    limitOrderAvailable: response.limitOrderAvailableFlag,
    marketOrderAvailable: response.marketOrderAvailableFlag,
    apiTradeAvailable: response.apiTradeAvailableFlag
  };
}

export function formatTradingStatusReport(
  report: TradingStatusReport,
  format: TradingStatusFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    [
      'figi',
      'instrumentUid',
      'tradingStatus',
      'limitOrderAvailable',
      'marketOrderAvailable',
      'apiTradeAvailable'
    ],
    [
      report.figi,
      report.instrumentUid,
      report.tradingStatus,
      String(report.limitOrderAvailable),
      String(report.marketOrderAvailable),
      String(report.apiTradeAvailable)
    ]
  ]);
}

export function formatTradingStatus(
  response: GetTradingStatusResponse,
  format: TradingStatusFormat
): string {
  return formatTradingStatusReport(createTradingStatusReport(response), format);
}
