/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Одна историческая свеча в отчете команды `marketdata get-candles`. */
export interface CandlesReportCandle {
  /** Время свечи в ISO-формате. */
  time: string;
  /** Цена открытия в строковом формате quotation. */
  open: string;
  /** Максимальная цена в строковом формате quotation. */
  high: string;
  /** Минимальная цена в строковом формате quotation. */
  low: string;
  /** Цена закрытия в строковом формате quotation. */
  close: string;
  /** Объем торгов. */
  volume: number;
  /** Признак завершенной свечи. */
  isComplete: boolean;
}

/** Отчет команды `marketdata get-candles` на application/output boundary. */
export type CandlesReport = CandlesReportCandle[];
