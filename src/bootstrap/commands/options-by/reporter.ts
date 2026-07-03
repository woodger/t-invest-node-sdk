/**
 * Модуль CLI-репортинга команды `instruments options-by`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { OptionsByReport } from '../../../application/reports';
import type { Option } from '../../../generated/instruments';
import { renderJson } from 'icore';
import {
  createOptionReportInstrument,
  optionFormats,
  renderOptionRows,
  type OptionFormat
} from '../option/reporter';

export const optionsByFormats = optionFormats;

export type OptionsByFormat = OptionFormat;

export function createOptionsByReport(instruments: Option[]): OptionsByReport {
  return instruments.map(createOptionReportInstrument);
}

export function formatOptionsByReport(
  report: OptionsByReport,
  format: OptionsByFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderOptionRows(report);
}

export function formatOptionsBy(instruments: Option[], format: OptionsByFormat): string {
  return formatOptionsByReport(createOptionsByReport(instruments), format);
}
