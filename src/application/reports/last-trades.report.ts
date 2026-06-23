/** Одна обезличенная сделка в отчете команды `marketdata get-last-trades`. */
export interface LastTradesReportTrade {
  figi: string;
  instrumentUid: string;
  direction: string;
  price: string;
  quantity: number;
  time: string;
}

/** Отчет команды `marketdata get-last-trades` на application/output boundary. */
export type LastTradesReport = LastTradesReportTrade[];
