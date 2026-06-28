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
