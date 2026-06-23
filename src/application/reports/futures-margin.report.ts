/** Отчет команды `instruments get-futures-margin` на application/output boundary. */
export interface FuturesMarginReport {
  initialMarginOnBuy: string;
  initialMarginOnSell: string;
  minPriceIncrement: string;
  minPriceIncrementAmount: string;
}
