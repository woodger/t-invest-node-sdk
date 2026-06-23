/**
 * Модуль CLI-репортинга команды `instruments bonds`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { BondsReport } from '../../../application/reports';
import type { Bond } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import {
  bondFormats,
  createBondReportInstrument,
  renderBondRows,
  type BondFormat
} from '../bond/reporter';

export const bondsFormats = bondFormats;

export type BondsFormat = BondFormat;

export function createBondsReport(instruments: Bond[]): BondsReport {
  return instruments.map(createBondReportInstrument);
}

export function formatBondsReport(report: BondsReport, format: BondsFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderBondRows(report);
}

export function formatBonds(instruments: Bond[], format: BondsFormat): string {
  return formatBondsReport(createBondsReport(instruments), format);
}
