/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Результат успешного вызова `stoporders cancel-stop-order`. */
export interface CancelStopOrderReport {
  /** Время отмены в ISO-формате или пустая строка. */
  time: string;
}
