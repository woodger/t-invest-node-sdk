/**
 * Модуль CLI-репортинга команды `instrument favorite edit`.
 *
 * `editFavorites` возвращает тот же список инструментов, что используется в
 * `getFavorites`, поэтому команда переиспользует favorites report.
 */

import type { EditFavoritesResponse } from '../../../generated/instruments';
import {
  createFavoritesReport,
  favoritesFormats,
  formatFavoritesReport,
  type FavoritesFormat
} from '../favorites/reporter';

/** Представление результата изменения избранных инструментов: JSON или таблица. */
export type EditFavoritesFormat = FavoritesFormat;

export const editFavoritesFormats = favoritesFormats;

export function createEditFavoritesReport(response: EditFavoritesResponse) {
  return createFavoritesReport(response.favoriteInstruments);
}

export function formatEditFavoritesReport(
  report: ReturnType<typeof createEditFavoritesReport>,
  format: EditFavoritesFormat
): string {
  return formatFavoritesReport(report, format);
}

export function formatEditFavorites(
  response: EditFavoritesResponse,
  format: EditFavoritesFormat
): string {
  return formatEditFavoritesReport(createEditFavoritesReport(response), format);
}
