/**
 * Модуль CLI-репортинга команды `instrument future list`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { FuturesReport } from '../../../application/reports';
import type { Future } from '../../../generated/t_tech/invest/grpc/instruments';
import { renderJson } from 'icore';
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
