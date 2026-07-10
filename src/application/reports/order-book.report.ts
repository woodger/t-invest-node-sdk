/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Один уровень стакана в отчете команды `marketdata get-order-book`. */
export interface OrderBookReportLevel {
  side: 'bid' | 'ask';
  /** Цена уровня в денежном строковом формате отчета. */
  price: string;
  /** Количество инструментов на уровне. */
  quantity: number;
}

/** Отчет команды `marketdata get-order-book` на application/output boundary. */
export interface OrderBookReport {
  figi: string;
  instrumentUid: string;
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
  levels: OrderBookReportLevel[];
}
