/** Одна дивидендная выплата в отчете команды `instruments get-dividends`. */
export interface DividendsReportItem {
  /** Размер дивиденда после налога в денежном строковом формате отчета. */
  dividendNet: string;
  /** Дата выплаты в ISO-формате или пустая строка. */
  paymentDate: string;
  /** Дата объявления в ISO-формате или пустая строка. */
  declaredDate: string;
  /** Последняя дата покупки в ISO-формате или пустая строка. */
  lastBuyDate: string;
  /** Тип дивиденда. */
  dividendType: string;
  /** Дата фиксации реестра в ISO-формате или пустая строка. */
  recordDate: string;
  /** Регулярность выплаты. */
  regularity: string;
  /** Цена закрытия в денежном строковом формате отчета. */
  closePrice: string;
  /** Дивидендная доходность в строковом формате quotation. */
  yieldValue: string;
  /** Дата создания записи в ISO-формате или пустая строка. */
  createdAt: string;
}

/** Отчет команды `instruments get-dividends` на application/output boundary. */
export type DividendsReport = DividendsReportItem[];
