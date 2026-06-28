/**
 * Модуль CLI-репортинга команды `orders get-orders`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  OrdersReport,
  OrdersReportOrder,
  OrdersReportStage
} from '../../../application/reports';
import {
  type GetOrdersResponse,
  type OrderStage,
  type OrderState,
  orderDirectionToJSON,
  orderExecutionReportStatusToJSON,
  orderTypeToJSON
} from '../../../generated/orders';
import {
  formatReportDate,
  formatReportMoney
} from '../../../infrastructure/report-values';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const ordersFormats = ['json', 'table'] as const;

export type OrdersFormat = typeof ordersFormats[number];

function toReportStage(stage: OrderStage): OrdersReportStage {
  return {
    price: formatReportMoney(stage.price),
    quantity: stage.quantity,
    tradeId: stage.tradeId
  };
}

export function createOrderStateReport(order: OrderState): OrdersReportOrder {
  return {
    orderId: order.orderId,
    orderRequestId: order.orderRequestId,
    figi: order.figi,
    instrumentUid: order.instrumentUid,
    status: orderExecutionReportStatusToJSON(order.executionReportStatus),
    direction: orderDirectionToJSON(order.direction),
    orderType: orderTypeToJSON(order.orderType),
    lotsRequested: order.lotsRequested,
    lotsExecuted: order.lotsExecuted,
    initialOrderPrice: formatReportMoney(order.initialOrderPrice),
    executedOrderPrice: formatReportMoney(order.executedOrderPrice),
    totalOrderAmount: formatReportMoney(order.totalOrderAmount),
    averagePositionPrice: formatReportMoney(order.averagePositionPrice),
    initialCommission: formatReportMoney(order.initialCommission),
    executedCommission: formatReportMoney(order.executedCommission),
    serviceCommission: formatReportMoney(order.serviceCommission),
    currency: order.currency,
    orderDate: formatReportDate(order.orderDate),
    stages: order.stages.map(toReportStage)
  };
}

export function createOrdersReport(response: GetOrdersResponse): OrdersReport {
  return response.orders.map(createOrderStateReport);
}

export function formatOrdersReport(report: OrdersReport, format: OrdersFormat): string {
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
    ...report.map((order) => [
      order.orderId,
      order.figi,
      order.instrumentUid,
      order.status,
      order.direction,
      order.orderType,
      String(order.lotsRequested),
      String(order.lotsExecuted),
      order.initialOrderPrice,
      order.executedOrderPrice,
      order.totalOrderAmount,
      order.orderDate
    ])
  ]);
}

export function formatOrders(response: GetOrdersResponse, format: OrdersFormat): string {
  return formatOrdersReport(createOrdersReport(response), format);
}
