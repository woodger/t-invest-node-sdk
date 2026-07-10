/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Одна обезличенная сделка в отчете команды `marketdata get-last-trades`. */
export interface LastTradesReportTrade {
  figi: string;
  instrumentUid: string;
  /** Направление сделки в формате generated enum JSON name. */
  direction: string;
  /** Цена сделки в денежном строковом формате отчета. */
  price: string;
  /** Количество инструментов в сделке. */
  quantity: number;
  /** Время сделки в ISO-формате или пустая строка. */
  time: string;
}

/** Отчет команды `marketdata get-last-trades` на application/output boundary. */
export type LastTradesReport = LastTradesReportTrade[];
