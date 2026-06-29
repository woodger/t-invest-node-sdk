/**
 * Модуль CLI-репортинга команды `orders post-order`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { OrderMutationReport } from '../../../application/reports';
import {
  orderDirectionToJSON,
  orderExecutionReportStatusToJSON,
  orderTypeToJSON,
  type PostOrderResponse
} from '../../../generated/orders';
import {
  formatReportMoneyText,
  formatReportQuotation,
  toReportMoney
} from '../../../infrastructure/report-values';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const postOrderFormats = ['json', 'table'] as const;

export type PostOrderFormat = typeof postOrderFormats[number];

export function createOrderMutationReport(response: PostOrderResponse): OrderMutationReport {
  return {
    orderId: response.orderId,
    status: orderExecutionReportStatusToJSON(response.executionReportStatus),
    lotsRequested: response.lotsRequested,
    lotsExecuted: response.lotsExecuted,
    initialOrderPrice: toReportMoney(response.initialOrderPrice),
    executedOrderPrice: toReportMoney(response.executedOrderPrice),
    totalOrderAmount: toReportMoney(response.totalOrderAmount),
    initialCommission: toReportMoney(response.initialCommission),
    executedCommission: toReportMoney(response.executedCommission),
    aciValue: toReportMoney(response.aciValue),
    figi: response.figi,
    direction: orderDirectionToJSON(response.direction),
    initialSecurityPrice: toReportMoney(response.initialSecurityPrice),
    orderType: orderTypeToJSON(response.orderType),
    message: response.message,
    initialOrderPricePt: formatReportQuotation(response.initialOrderPricePt),
    instrumentUid: response.instrumentUid
  };
}

export function formatOrderMutationReport(
  report: OrderMutationReport,
  format: PostOrderFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    [
      'orderId',
      'status',
      'direction',
      'orderType',
      'lotsRequested',
      'lotsExecuted',
      'initialOrderPrice',
      'executedOrderPrice',
      'totalOrderAmount',
      'initialCommission',
      'executedCommission',
      'instrumentUid',
      'message'
    ],
    [
      report.orderId,
      report.status,
      report.direction,
      report.orderType,
      String(report.lotsRequested),
      String(report.lotsExecuted),
      formatReportMoneyText(report.initialOrderPrice),
      formatReportMoneyText(report.executedOrderPrice),
      formatReportMoneyText(report.totalOrderAmount),
      formatReportMoneyText(report.initialCommission),
      formatReportMoneyText(report.executedCommission),
      report.instrumentUid,
      report.message
    ]
  ]);
}

export function formatPostOrder(response: PostOrderResponse, format: PostOrderFormat): string {
  return formatOrderMutationReport(createOrderMutationReport(response), format);
}
