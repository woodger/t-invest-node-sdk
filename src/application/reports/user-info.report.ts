/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Отчет команды `users get-info` на application/output boundary. */
export interface UserInfoReport {
  premStatus: boolean;
  qualStatus: boolean;
  qualifiedForWorkWith: string[];
  tariff: string;
}
