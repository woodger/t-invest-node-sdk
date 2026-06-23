/**
 * Модуль CLI-репортинга команды `instruments futures`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { FuturesReport } from '../../../application/reports';
import type { Future } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import {
  createFutureReportInstrument,
  futureFormats,
  renderFutureRows,
  type FutureFormat
} from '../future/reporter';

export const futuresFormats = futureFormats;

export type FuturesFormat = FutureFormat;

export function createFuturesReport(instruments: Future[]): FuturesReport {
  return instruments.map(createFutureReportInstrument);
}

export function formatFuturesReport(report: FuturesReport, format: FuturesFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderFutureRows(report);
}

export function formatFutures(instruments: Future[], format: FuturesFormat): string {
  return formatFuturesReport(createFuturesReport(instruments), format);
}
