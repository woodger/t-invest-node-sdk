/**
 * Модуль CLI-репортинга команды `marketdata get-last-trades`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { LastTradesReport, LastTradesReportTrade } from '../../../application/reports';
import type { Quotation } from '../../../generated/common';
import {
  tradeDirectionToJSON,
  type Trade
} from '../../../generated/marketdata';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const lastTradesFormats = ['json', 'table'] as const;

export type LastTradesFormat = typeof lastTradesFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function formatQuotation(value: Quotation | undefined): string {
  if (value === undefined) {
    return '';
  }

  return String(value.units + value.nano / 1e9);
}

function toReportTrade(trade: Trade): LastTradesReportTrade {
  return {
    figi: trade.figi,
    instrumentUid: trade.instrumentUid,
    direction: tradeDirectionToJSON(trade.direction),
    price: formatQuotation(trade.price),
    quantity: trade.quantity,
    time: formatDate(trade.time)
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
