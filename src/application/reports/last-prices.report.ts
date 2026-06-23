/** Одна последняя цена инструмента в отчете команды `marketdata get-last-prices`. */
export interface LastPricesReportPrice {
  figi: string;
  instrumentUid: string;
  price: string;
  time: string;
}

/** Отчет команды `marketdata get-last-prices` на application/output boundary. */
export type LastPricesReport = LastPricesReportPrice[];
