/**
 * Модуль CLI-репортинга команды `operations get-operations-by-cursor`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  OperationsByCursorReport,
  OperationsByCursorReportItem
} from '../../../application/reports';
import { instrumentTypeToJSON } from '../../../generated/common';
import {
  operationStateToJSON,
  operationTypeToJSON,
  type GetOperationsByCursorResponse,
  type OperationItem
} from '../../../generated/operations';
import {
  formatReportDate,
  formatReportMoneyText,
  formatReportQuotation,
  toReportMoney
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const operationsByCursorFormats = ['json', 'table'] as const;

export type OperationsByCursorFormat = typeof operationsByCursorFormats[number];

function toReportItem(item: OperationItem): OperationsByCursorReportItem {
  return {
    cursor: item.cursor,
    brokerAccountId: item.brokerAccountId,
    id: item.id,
    parentOperationId: item.parentOperationId,
    name: item.name,
    date: formatReportDate(item.date),
    type: operationTypeToJSON(item.type),
    description: item.description,
    state: operationStateToJSON(item.state),
    figi: item.figi,
    instrumentUid: item.instrumentUid,
    instrumentType: item.instrumentType,
    instrumentKind: instrumentTypeToJSON(item.instrumentKind),
    positionUid: item.positionUid,
    payment: toReportMoney(item.payment),
    price: toReportMoney(item.price),
    commission: toReportMoney(item.commission),
    yield: toReportMoney(item.yield),
    yieldRelative: formatReportQuotation(item.yieldRelative),
    accruedInt: toReportMoney(item.accruedInt),
    quantity: item.quantity,
    quantityRest: item.quantityRest,
    quantityDone: item.quantityDone,
    cancelDateTime: formatReportDate(item.cancelDateTime),
    cancelReason: item.cancelReason,
    assetUid: item.assetUid,
    tradesCount: item.tradesInfo?.trades.length ?? 0
  };
}

export function createOperationsByCursorReport(
  response: GetOperationsByCursorResponse
): OperationsByCursorReport {
  return {
    page: {
      hasNext: response.hasNext,
      nextCursor: response.nextCursor,
      itemsCount: response.items.length
    },
    items: response.items.map(toReportItem)
  };
}

export function formatOperationsByCursorReport(
  report: OperationsByCursorReport,
  format: OperationsByCursorFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  const table = renderTextTable([
    [
      'cursor',
      'id',
      'date',
      'name',
      'type',
      'state',
      'payment',
      'price',
      'commission',
      'quantity',
      'quantityDone',
      'figi',
      'instrumentUid',
      'tradesCount'
    ],
    ...report.items.map((item) => [
      item.cursor,
      item.id,
      item.date,
      item.name,
      item.type,
      item.state,
      formatReportMoneyText(item.payment),
      formatReportMoneyText(item.price),
      formatReportMoneyText(item.commission),
      String(item.quantity),
      String(item.quantityDone),
      item.figi,
      item.instrumentUid,
      String(item.tradesCount)
    ])
  ]);

  return [
    `hasNext: ${String(report.page.hasNext)}`,
    `nextCursor: ${report.page.nextCursor}`,
    `itemsCount: ${String(report.page.itemsCount)}`,
    '',
    table
  ].join('\n');
}

export function formatOperationsByCursor(
  response: GetOperationsByCursorResponse,
  format: OperationsByCursorFormat
): string {
  return formatOperationsByCursorReport(createOperationsByCursorReport(response), format);
}
