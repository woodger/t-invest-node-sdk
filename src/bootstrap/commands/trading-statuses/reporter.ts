/**
 * Модуль CLI-репортинга команды `market statuses`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { TradingStatusesReport } from '../../../application/reports';
import type { GetTradingStatusesResponse } from '../../../generated/t_tech/invest/grpc/marketdata';
import { renderJson, renderTextTable } from 'icore';
import {
  createTradingStatusReport,
  tradingStatusFormats,
  type TradingStatusFormat
} from '../trading-status/reporter';

export const tradingStatusesFormats = tradingStatusFormats;

export type TradingStatusesFormat = TradingStatusFormat;

export function createTradingStatusesReport(response: GetTradingStatusesResponse): TradingStatusesReport {
  return response.tradingStatuses.map(createTradingStatusReport);
}

export function formatTradingStatusesReport(
  report: TradingStatusesReport,
  format: TradingStatusesFormat
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
    ...report.map((status) => [
      status.figi,
      status.instrumentUid,
      status.tradingStatus,
      String(status.limitOrderAvailable),
      String(status.marketOrderAvailable),
      String(status.apiTradeAvailable)
    ])
  ]);
}

export function formatTradingStatuses(
  response: GetTradingStatusesResponse,
  format: TradingStatusesFormat
): string {
  return formatTradingStatusesReport(createTradingStatusesReport(response), format);
}
