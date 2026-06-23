/**
 * Модуль CLI-репортинга команды `orders`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type {
  OrdersReport,
  OrdersReportOrder,
  OrdersReportStage
} from '../../../application/reports';
import type { MoneyValue } from '../../../generated/common';
import {
  type GetOrdersResponse,
  type OrderStage,
  type OrderState,
  orderDirectionToJSON,
  orderExecutionReportStatusToJSON,
  orderTypeToJSON
} from '../../../generated/orders';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const ordersFormats = ['json', 'table'] as const;

export type OrdersFormat = typeof ordersFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function formatDecimal(value: MoneyValue | undefined): string {
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

function toReportStage(stage: OrderStage): OrdersReportStage {
  return {
    price: formatMoney(stage.price),
    quantity: stage.quantity,
    tradeId: stage.tradeId
  };
}

function toReportOrder(order: OrderState): OrdersReportOrder {
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
    initialOrderPrice: formatMoney(order.initialOrderPrice),
    executedOrderPrice: formatMoney(order.executedOrderPrice),
    totalOrderAmount: formatMoney(order.totalOrderAmount),
    averagePositionPrice: formatMoney(order.averagePositionPrice),
    initialCommission: formatMoney(order.initialCommission),
    executedCommission: formatMoney(order.executedCommission),
    serviceCommission: formatMoney(order.serviceCommission),
    currency: order.currency,
    orderDate: formatDate(order.orderDate),
    stages: order.stages.map(toReportStage)
  };
}

export function createOrdersReport(response: GetOrdersResponse): OrdersReport {
  return response.orders.map(toReportOrder);
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
