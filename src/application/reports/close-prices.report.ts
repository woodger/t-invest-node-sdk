/** Одна цена закрытия торговой сессии в отчете команды `marketdata get-close-prices`. */
export interface ClosePricesReportPrice {
  figi: string;
  instrumentUid: string;
  price: string;
  time: string;
}

/** Отчет команды `marketdata get-close-prices` на application/output boundary. */
export type ClosePricesReport = ClosePricesReportPrice[];
