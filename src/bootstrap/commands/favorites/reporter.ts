/**
 * Модуль CLI-репортинга команды `instruments get-favorites`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type {
  FavoritesReport,
  FavoritesReportInstrument
} from '../../../application/reports';
import { instrumentTypeToJSON } from '../../../generated/common';
import type { FavoriteInstrument } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const favoritesFormats = ['json', 'table'] as const;

export type FavoritesFormat = typeof favoritesFormats[number];

function toReportInstrument(instrument: FavoriteInstrument): FavoritesReportInstrument {
  return {
    figi: instrument.figi,
    ticker: instrument.ticker,
    classCode: instrument.classCode,
    isin: instrument.isin,
    instrumentType: instrument.instrumentType,
    instrumentKind: instrumentTypeToJSON(instrument.instrumentKind),
    otcFlag: instrument.otcFlag,
    apiTradeAvailableFlag: instrument.apiTradeAvailableFlag
  };
}

export function createFavoritesReport(instruments: FavoriteInstrument[]): FavoritesReport {
  return instruments.map(toReportInstrument);
}

export function formatFavoritesReport(
  report: FavoritesReport,
  format: FavoritesFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    [
      'figi',
      'ticker',
      'classCode',
      'isin',
      'instrumentType',
      'instrumentKind',
      'otcFlag',
      'apiTradeAvailableFlag'
    ],
    ...report.map((instrument) => [
      instrument.figi,
      instrument.ticker,
      instrument.classCode,
      instrument.isin,
      instrument.instrumentType,
      instrument.instrumentKind,
      String(instrument.otcFlag),
      String(instrument.apiTradeAvailableFlag)
    ])
  ]);
}

export function formatFavorites(
  instruments: FavoriteInstrument[],
  format: FavoritesFormat
): string {
  return formatFavoritesReport(createFavoritesReport(instruments), format);
}
