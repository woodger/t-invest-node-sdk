/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Одна запись НКД в отчете команды `instruments get-accrued-interests`. */
export interface AccruedInterestsReportItem {
  /** Дата расчета НКД в ISO-формате. */
  date: string;
  /** Значение НКД в денежном строковом формате отчета. */
  value: string;
  /** Значение НКД в процентах в строковом формате отчета. */
  valuePercent: string;
  /** Номинал облигации в денежном строковом формате отчета. */
  nominal: string;
}

/** Отчет команды `instruments get-accrued-interests` на application/output boundary. */
export type AccruedInterestsReport = AccruedInterestsReportItem[];
