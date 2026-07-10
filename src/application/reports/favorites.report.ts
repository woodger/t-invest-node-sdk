/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Один избранный инструмент в отчете команды `instruments get-favorites`. */
export interface FavoritesReportInstrument {
  figi: string;
  ticker: string;
  classCode: string;
  isin: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  /** Вид инструмента в формате generated enum JSON name. */
  instrumentKind: string;
  otcFlag: boolean;
  apiTradeAvailableFlag: boolean;
}

/** Отчет команды `instruments get-favorites` на application/output boundary. */
export type FavoritesReport = FavoritesReportInstrument[];
