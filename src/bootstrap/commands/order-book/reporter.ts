/**
 * Модуль CLI-репортинга команды `market order-book`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  OrderBookReport,
  OrderBookReportLevel
} from '../../../application/reports';
import type {
  GetOrderBookResponse,
  Order
} from '../../../generated/t_tech/invest/grpc/marketdata';
import {
  formatReportDate,
  formatReportQuotation
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const orderBookFormats = ['json', 'table'] as const;

export type OrderBookFormat = typeof orderBookFormats[number];

function toReportLevel(side: OrderBookReportLevel['side'], order: Order): OrderBookReportLevel {
  return {
    side,
    price: formatReportQuotation(order.price),
    quantity: order.quantity
  };
}

export function createOrderBookReport(response: GetOrderBookResponse): OrderBookReport {
  return {
    figi: response.figi,
    instrumentUid: response.instrumentUid,
    depth: response.depth,
    lastPrice: formatReportQuotation(response.lastPrice),
    closePrice: formatReportQuotation(response.closePrice),
    limitUp: formatReportQuotation(response.limitUp),
    limitDown: formatReportQuotation(response.limitDown),
    lastPriceTime: formatReportDate(response.lastPriceTs),
    closePriceTime: formatReportDate(response.closePriceTs),
    orderBookTime: formatReportDate(response.orderbookTs),
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
