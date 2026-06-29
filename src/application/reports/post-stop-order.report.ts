/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Результат успешного вызова `stoporders post-stop-order`. */
export interface PostStopOrderReport {
  /** Идентификатор стоп-заявки, который вернул provider. */
  stopOrderId: string;
}
