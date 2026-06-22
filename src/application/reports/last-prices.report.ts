/** Одна последняя цена инструмента в отчете команды `last-prices`. */
export interface LastPricesReportPrice {
  figi: string;
  instrumentUid: string;
  price: string;
  time: string;
}

/** Отчет команды `last-prices` на application/output boundary. */
export type LastPricesReport = LastPricesReportPrice[];
