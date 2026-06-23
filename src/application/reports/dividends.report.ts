/** Одна дивидендная выплата в отчете команды `instruments get-dividends`. */
export interface DividendsReportItem {
  dividendNet: string;
  paymentDate: string;
  declaredDate: string;
  lastBuyDate: string;
  dividendType: string;
  recordDate: string;
  regularity: string;
  closePrice: string;
  yieldValue: string;
  createdAt: string;
}

/** Отчет команды `instruments get-dividends` на application/output boundary. */
export type DividendsReport = DividendsReportItem[];
