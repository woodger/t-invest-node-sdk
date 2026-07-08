/**
 * Модуль CLI-репортинга команды `instrument share list`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { SharesReport } from '../../../application/reports';
import type { Share } from '../../../generated/instruments';
import { renderJson } from 'icore';
import {
  createShareReportInstrument,
  renderShareRows,
  shareFormats,
  type ShareFormat
} from '../share/reporter';

export const sharesFormats = shareFormats;

export type SharesFormat = ShareFormat;

export function createSharesReport(instruments: Share[]): SharesReport {
  return instruments.map(createShareReportInstrument);
}

export function formatSharesReport(report: SharesReport, format: SharesFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderShareRows(report);
}

export function formatShares(instruments: Share[], format: SharesFormat): string {
  return formatSharesReport(createSharesReport(instruments), format);
}
