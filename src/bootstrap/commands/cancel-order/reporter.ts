/**
 * Модуль CLI-репортинга команды `orders cancel-order`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { CancelOrderReport } from '../../../application/reports';
import type { CancelOrderResponse } from '../../../generated/orders';
import { formatReportDate } from '../../../infrastructure/report-values';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const cancelOrderFormats = ['json', 'table'] as const;

export type CancelOrderFormat = typeof cancelOrderFormats[number];

export function createCancelOrderReport(response: CancelOrderResponse): CancelOrderReport {
  return {
    time: formatReportDate(response.time)
  };
}

export function formatCancelOrderReport(
  report: CancelOrderReport,
  format: CancelOrderFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['time'],
    [report.time]
  ]);
}

export function formatCancelOrder(
  response: CancelOrderResponse,
  format: CancelOrderFormat
): string {
  return formatCancelOrderReport(createCancelOrderReport(response), format);
}
