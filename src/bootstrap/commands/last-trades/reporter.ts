/**
 * Модуль CLI-репортинга команды `market trades`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { LastTradesReport, LastTradesReportTrade } from '../../../application/reports';
import {
  tradeDirectionToJSON,
  type Trade
} from '../../../generated/t_tech/invest/grpc/marketdata';
import {
  formatReportDate,
  formatReportQuotation
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const lastTradesFormats = ['json', 'table'] as const;

export type LastTradesFormat = typeof lastTradesFormats[number];

function toReportTrade(trade: Trade): LastTradesReportTrade {
  return {
    figi: trade.figi,
    instrumentUid: trade.instrumentUid,
    direction: tradeDirectionToJSON(trade.direction),
    price: formatReportQuotation(trade.price),
    quantity: trade.quantity,
    time: formatReportDate(trade.time)
  };
}

export function createLastTradesReport(trades: Trade[]): LastTradesReport {
  return trades.map(toReportTrade);
}

export function formatLastTradesReport(
  report: LastTradesReport,
  format: LastTradesFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['figi', 'instrumentUid', 'direction', 'price', 'quantity', 'time'],
    ...report.map((trade) => [
      trade.figi,
      trade.instrumentUid,
      trade.direction,
      trade.price,
      String(trade.quantity),
      trade.time
    ])
  ]);
}

export function formatLastTrades(trades: Trade[], format: LastTradesFormat): string {
  return formatLastTradesReport(createLastTradesReport(trades), format);
}
