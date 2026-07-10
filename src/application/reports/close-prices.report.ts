/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Одна цена закрытия торговой сессии в отчете команды `marketdata get-close-prices`. */
export interface ClosePricesReportPrice {
  figi: string;
  instrumentUid: string;
  /** Цена закрытия в строковом формате quotation. */
  price: string;
  /** Время цены закрытия в ISO-формате или пустая строка. */
  time: string;
}

/** Отчет команды `marketdata get-close-prices` на application/output boundary. */
export type ClosePricesReport = ClosePricesReportPrice[];
