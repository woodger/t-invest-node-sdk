/** Один уровень стакана в отчете команды `marketdata get-order-book`. */
export interface OrderBookReportLevel {
  /** Сторона стакана. */
  side: 'bid' | 'ask';
  /** Цена уровня в денежном строковом формате отчета. */
  price: string;
  /** Количество инструментов на уровне. */
  quantity: number;
}

/** Отчет команды `marketdata get-order-book` на application/output boundary. */
export interface OrderBookReport {
  /** FIGI инструмента. */
  figi: string;
  /** UID инструмента. */
  instrumentUid: string;
  /** Глубина стакана. */
  depth: number;
  /** Последняя цена в денежном строковом формате отчета. */
  lastPrice: string;
  /** Цена закрытия в денежном строковом формате отчета. */
  closePrice: string;
  /** Верхняя граница цены в денежном строковом формате отчета. */
  limitUp: string;
  /** Нижняя граница цены в денежном строковом формате отчета. */
  limitDown: string;
  /** Время последней цены в ISO-формате или пустая строка. */
  lastPriceTime: string;
  /** Время цены закрытия в ISO-формате или пустая строка. */
  closePriceTime: string;
  /** Время стакана в ISO-формате или пустая строка. */
  orderBookTime: string;
  /** Уровни bid/ask стакана. */
  levels: OrderBookReportLevel[];
}
