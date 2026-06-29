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

/** Отчет команды `instruments get-futures-margin` на application/output boundary. */
export interface FuturesMarginReport {
  /** Начальная маржа на покупку или `null`, если provider не вернул значение. */
  initialMarginOnBuy: ReportMoney | null;
  /** Начальная маржа на продажу или `null`, если provider не вернул значение. */
  initialMarginOnSell: ReportMoney | null;
  /** Минимальный шаг цены в строковом формате quotation. */
  minPriceIncrement: string;
  /** Стоимость минимального шага цены в денежном строковом формате отчета. */
  minPriceIncrementAmount: string;
}
