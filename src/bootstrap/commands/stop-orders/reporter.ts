/**
 * Модуль CLI-репортинга команды `stoporders get-stop-orders`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { StopOrdersReport, StopOrdersReportOrder } from '../../../application/reports';
import type { MoneyValue } from '../../../generated/common';
import {
  stopOrderDirectionToJSON,
  stopOrderTypeToJSON,
  type GetStopOrdersResponse,
  type StopOrder
} from '../../../generated/stoporders';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const stopOrdersFormats = ['json', 'table'] as const;

export type StopOrdersFormat = typeof stopOrdersFormats[number];

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

function toReportStopOrder(order: StopOrder): StopOrdersReportOrder {
  return {
    stopOrderId: order.stopOrderId,
    lotsRequested: order.lotsRequested,
    figi: order.figi,
    instrumentUid: order.instrumentUid,
    direction: stopOrderDirectionToJSON(order.direction),
    currency: order.currency,
    orderType: stopOrderTypeToJSON(order.orderType),
    createDate: formatDate(order.createDate),
    activationDateTime: formatDate(order.activationDateTime),
    expirationTime: formatDate(order.expirationTime),
    price: formatMoney(order.price),
    stopPrice: formatMoney(order.stopPrice)
  };
}

export function createStopOrdersReport(response: GetStopOrdersResponse): StopOrdersReport {
  return response.stopOrders.map(toReportStopOrder);
}

export function formatStopOrdersReport(
  report: StopOrdersReport,
  format: StopOrdersFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    [
      'stopOrderId',
      'figi',
      'instrumentUid',
      'direction',
      'orderType',
      'lotsRequested',
      'price',
      'stopPrice',
      'createDate',
      'expirationTime'
    ],
    ...report.map((order) => [
      order.stopOrderId,
      order.figi,
      order.instrumentUid,
      order.direction,
      order.orderType,
      String(order.lotsRequested),
      order.price,
      order.stopPrice,
      order.createDate,
      order.expirationTime
    ])
  ]);
}

export function formatStopOrders(
  response: GetStopOrdersResponse,
  format: StopOrdersFormat
): string {
  return formatStopOrdersReport(createStopOrdersReport(response), format);
}
