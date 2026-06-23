/**
 * Модуль CLI-репортинга команды `marketdata get-order-book`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type {
  OrderBookReport,
  OrderBookReportLevel
} from '../../../application/reports';
import type { Quotation } from '../../../generated/common';
import type {
  GetOrderBookResponse,
  Order
} from '../../../generated/marketdata';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const orderBookFormats = ['json', 'table'] as const;

export type OrderBookFormat = typeof orderBookFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function formatQuotation(value: Quotation | undefined): string {
  if (value === undefined) {
    return '';
  }

  return String(value.units + value.nano / 1e9);
}

function toReportLevel(side: OrderBookReportLevel['side'], order: Order): OrderBookReportLevel {
  return {
    side,
    price: formatQuotation(order.price),
    quantity: order.quantity
  };
}

export function createOrderBookReport(response: GetOrderBookResponse): OrderBookReport {
  return {
    figi: response.figi,
    instrumentUid: response.instrumentUid,
    depth: response.depth,
    lastPrice: formatQuotation(response.lastPrice),
    closePrice: formatQuotation(response.closePrice),
    limitUp: formatQuotation(response.limitUp),
    limitDown: formatQuotation(response.limitDown),
    lastPriceTime: formatDate(response.lastPriceTs),
    closePriceTime: formatDate(response.closePriceTs),
    orderBookTime: formatDate(response.orderbookTs),
    levels: [
      ...response.bids.map((order) => toReportLevel('bid', order)),
      ...response.asks.map((order) => toReportLevel('ask', order))
    ]
  };
}

export function formatOrderBookReport(
  report: OrderBookReport,
  format: OrderBookFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['figi', 'instrumentUid', 'depth', 'orderBookTime', 'side', 'price', 'quantity'],
    ...report.levels.map((level) => [
      report.figi,
      report.instrumentUid,
      String(report.depth),
      report.orderBookTime,
      level.side,
      level.price,
      String(level.quantity)
    ])
  ]);
}

export function formatOrderBook(response: GetOrderBookResponse, format: OrderBookFormat): string {
  return formatOrderBookReport(createOrderBookReport(response), format);
}
