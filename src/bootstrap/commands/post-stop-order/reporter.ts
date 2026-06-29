/**
 * Модуль CLI-репортинга команды `stoporders post-stop-order`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { PostStopOrderReport } from '../../../application/reports';
import type { PostStopOrderResponse } from '../../../generated/stoporders';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const postStopOrderFormats = ['json', 'table'] as const;

export type PostStopOrderFormat = typeof postStopOrderFormats[number];

export function createPostStopOrderReport(
  response: PostStopOrderResponse
): PostStopOrderReport {
  return {
    stopOrderId: response.stopOrderId
  };
}

export function formatPostStopOrderReport(
  report: PostStopOrderReport,
  format: PostStopOrderFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['stopOrderId'],
    [report.stopOrderId]
  ]);
}

export function formatPostStopOrder(
  response: PostStopOrderResponse,
  format: PostStopOrderFormat
): string {
  return formatPostStopOrderReport(createPostStopOrderReport(response), format);
}
