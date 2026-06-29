/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

import type { ReportMoney } from './money.report';

/** Отчет команды `users get-margin-attributes` на application/output boundary. */
export interface MarginAttributesReport {
  /** Ликвидная стоимость портфеля или `null`, если provider не вернул значение. */
  liquidPortfolio: ReportMoney | null;
  /** Начальная маржа или `null`, если provider не вернул значение. */
  startingMargin: ReportMoney | null;
  /** Минимальная маржа или `null`, если provider не вернул значение. */
  minimalMargin: ReportMoney | null;
  /** Уровень достаточности средств в строковом формате quotation. */
  fundsSufficiencyLevel: string;
  /** Недостающие средства или `null`, если provider не вернул значение. */
  amountOfMissingFunds: ReportMoney | null;
  /** Скорректированная маржа или `null`, если provider не вернул значение. */
  correctedMargin: ReportMoney | null;
}
