/**
 * Модуль CLI-репортинга команды `orders get-order-state`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { OrderStateReport } from '../../../application/reports';
import type { OrderState } from '../../../generated/orders';
import { formatReportMoneyText } from '../../../infrastructure/report-values';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';
import {
  createOrderStateReport,
  ordersFormats,
  type OrdersFormat
} from '../orders/reporter';

export const orderStateFormats = ordersFormats;

export type OrderStateFormat = OrdersFormat;

export function createSingleOrderStateReport(order: OrderState): OrderStateReport {
  return createOrderStateReport(order);
}

export function formatOrderStateReport(
  report: OrderStateReport,
  format: OrderStateFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    [
      'orderId',
      'figi',
      'instrumentUid',
      'status',
      'direction',
      'orderType',
      'lotsRequested',
      'lotsExecuted',
      'initialOrderPrice',
      'executedOrderPrice',
      'totalOrderAmount',
      'orderDate'
    ],
    [
      report.orderId,
      report.figi,
      report.instrumentUid,
      report.status,
      report.direction,
      report.orderType,
      String(report.lotsRequested),
      String(report.lotsExecuted),
      formatReportMoneyText(report.initialOrderPrice),
      formatReportMoneyText(report.executedOrderPrice),
      formatReportMoneyText(report.totalOrderAmount),
      report.orderDate
    ]
  ]);
}

export function formatOrderState(order: OrderState, format: OrderStateFormat): string {
  return formatOrderStateReport(createSingleOrderStateReport(order), format);
}
