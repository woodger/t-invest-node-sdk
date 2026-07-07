/**
 * Модуль CLI-репортинга команды `instrument etfs`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { EtfsReport } from '../../../application/reports';
import type { Etf } from '../../../generated/instruments';
import { renderJson } from 'icore';
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
