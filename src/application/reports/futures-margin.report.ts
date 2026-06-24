/** Отчет команды `instruments get-futures-margin` на application/output boundary. */
export interface FuturesMarginReport {
  /** Начальная маржа на покупку в денежном строковом формате отчета. */
  initialMarginOnBuy: string;
  /** Начальная маржа на продажу в денежном строковом формате отчета. */
  initialMarginOnSell: string;
  /** Минимальный шаг цены в строковом формате quotation. */
  minPriceIncrement: string;
  /** Стоимость минимального шага цены в денежном строковом формате отчета. */
  minPriceIncrementAmount: string;
}
