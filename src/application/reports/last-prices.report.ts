/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Одна последняя цена инструмента в отчете команды `marketdata get-last-prices`. */
export interface LastPricesReportPrice {
  /** FIGI инструмента. */
  figi: string;
  /** UID инструмента. */
  instrumentUid: string;
  /** Последняя цена в денежном строковом формате отчета. */
  price: string;
  /** Время цены в ISO-формате или пустая строка. */
  time: string;
}

/** Отчет команды `marketdata get-last-prices` на application/output boundary. */
export type LastPricesReport = LastPricesReportPrice[];
