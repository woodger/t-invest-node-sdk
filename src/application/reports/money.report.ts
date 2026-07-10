/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Денежное значение в стабильных report contracts. */
export interface ReportMoney {
  currency: string;
  /** Сумма в строковом формате decimal. */
  amount: string;
}
