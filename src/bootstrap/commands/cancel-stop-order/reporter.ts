/**
 * Модуль CLI-репортинга команды `stop-order cancel-stop-order`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { CancelStopOrderReport } from '../../../application/reports';
import type { CancelStopOrderResponse } from '../../../generated/stoporders';
import { formatReportDate } from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const cancelStopOrderFormats = ['json', 'table'] as const;

export type CancelStopOrderFormat = typeof cancelStopOrderFormats[number];

export function createCancelStopOrderReport(
  response: CancelStopOrderResponse
): CancelStopOrderReport {
  return {
    time: formatReportDate(response.time)
  };
}

export function formatCancelStopOrderReport(
  report: CancelStopOrderReport,
  format: CancelStopOrderFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['time'],
    [report.time]
  ]);
}

export function formatCancelStopOrder(
  response: CancelStopOrderResponse,
  format: CancelStopOrderFormat
): string {
  return formatCancelStopOrderReport(createCancelStopOrderReport(response), format);
}
