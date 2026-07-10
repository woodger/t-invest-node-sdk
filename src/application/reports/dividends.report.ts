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

/** Одна дивидендная выплата в отчете команды `instruments get-dividends`. */
export interface DividendsReportItem {
  /** Размер дивиденда после налога или `null`, если provider не вернул значение. */
  dividendNet: ReportMoney | null;
  /** Дата выплаты в ISO-формате или пустая строка. */
  paymentDate: string;
  /** Дата объявления в ISO-формате или пустая строка. */
  declaredDate: string;
  /** Последняя дата покупки в ISO-формате или пустая строка. */
  lastBuyDate: string;
  dividendType: string;
  /** Дата фиксации реестра в ISO-формате или пустая строка. */
  recordDate: string;
  regularity: string;
  /** Цена закрытия или `null`, если provider не вернул значение. */
  closePrice: ReportMoney | null;
  /** Дивидендная доходность в строковом формате quotation. */
  yieldValue: string;
  /** Дата создания записи в ISO-формате или пустая строка. */
  createdAt: string;
}

/** Отчет команды `instruments get-dividends` на application/output boundary. */
export type DividendsReport = DividendsReportItem[];
