/**
 * Модуль CLI-репортинга команды `operations get-operations`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { OperationsReport, OperationsReportOperation } from '../../../application/reports';
import type { MoneyValue } from '../../../generated/common';
import {
  operationStateToJSON,
  operationTypeToJSON,
  type Operation
} from '../../../generated/operations';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const operationsFormats = ['json', 'table'] as const;

export type OperationsFormat = typeof operationsFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function formatDecimal(value: MoneyValue): string {
  return String(value.units + value.nano / 1e9);
}

function formatMoney(value: MoneyValue | undefined): string {
  if (value === undefined) {
    return '';
  }

  const amount = formatDecimal(value);

  return value.currency === '' ? amount : `${amount} ${value.currency}`;
}

function toReportOperation(operation: Operation): OperationsReportOperation {
  return {
    id: operation.id,
    parentOperationId: operation.parentOperationId,
    date: formatDate(operation.date),
    type: operation.type,
    operationType: operationTypeToJSON(operation.operationType),
    state: operationStateToJSON(operation.state),
    currency: operation.currency,
    payment: formatMoney(operation.payment),
    price: formatMoney(operation.price),
    quantity: operation.quantity,
    quantityRest: operation.quantityRest,
    figi: operation.figi,
    instrumentUid: operation.instrumentUid,
    positionUid: operation.positionUid,
    assetUid: operation.assetUid,
    instrumentType: operation.instrumentType,
    tradesCount: operation.trades.length
  };
}

export function createOperationsReport(operations: Operation[]): OperationsReport {
  return operations.map(toReportOperation);
}

export function formatOperationsReport(
  report: OperationsReport,
  format: OperationsFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    [
      'id',
      'date',
      'type',
      'operationType',
      'state',
      'payment',
      'price',
      'quantity',
      'quantityRest',
      'figi',
      'instrumentUid',
      'tradesCount'
    ],
    ...report.map((operation) => [
      operation.id,
      operation.date,
      operation.type,
      operation.operationType,
      operation.state,
      operation.payment,
      operation.price,
      String(operation.quantity),
      String(operation.quantityRest),
      operation.figi,
      operation.instrumentUid,
      String(operation.tradesCount)
    ])
  ]);
}

export function formatOperations(operations: Operation[], format: OperationsFormat): string {
  return formatOperationsReport(createOperationsReport(operations), format);
}
