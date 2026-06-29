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
  /** Признак премиального статуса пользователя. */
  premStatus: boolean;
  /** Признак статуса квалифицированного инвестора. */
  qualStatus: boolean;
  /** Инструменты, доступные пользователю как квалифицированному инвестору. */
  qualifiedForWorkWith: string[];
  /** Тариф пользователя. */
  tariff: string;
}
