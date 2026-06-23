/**
 * Модуль CLI-репортинга команды `instruments etfs`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { EtfsReport } from '../../../application/reports';
import type { Etf } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import {
  createEtfReportInstrument,
  etfFormats,
  renderEtfRows,
  type EtfFormat
} from '../etf/reporter';

export const etfsFormats = etfFormats;

export type EtfsFormat = EtfFormat;

export function createEtfsReport(instruments: Etf[]): EtfsReport {
  return instruments.map(createEtfReportInstrument);
}

export function formatEtfsReport(report: EtfsReport, format: EtfsFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderEtfRows(report);
}

export function formatEtfs(instruments: Etf[], format: EtfsFormat): string {
  return formatEtfsReport(createEtfsReport(instruments), format);
}
