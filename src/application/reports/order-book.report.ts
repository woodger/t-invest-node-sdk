/** Один уровень стакана в отчете команды `marketdata get-order-book`. */
export interface OrderBookReportLevel {
  side: 'bid' | 'ask';
  price: string;
  quantity: number;
}

/** Отчет команды `marketdata get-order-book` на application/output boundary. */
export interface OrderBookReport {
  figi: string;
  instrumentUid: string;
  depth: number;
  lastPrice: string;
  closePrice: string;
  limitUp: string;
  limitDown: string;
  lastPriceTime: string;
  closePriceTime: string;
  orderBookTime: string;
  levels: OrderBookReportLevel[];
}
