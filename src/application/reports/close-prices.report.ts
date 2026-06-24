/** Одна цена закрытия торговой сессии в отчете команды `marketdata get-close-prices`. */
export interface ClosePricesReportPrice {
  /** FIGI инструмента. */
  figi: string;
  /** UID инструмента. */
  instrumentUid: string;
  /** Цена закрытия в строковом формате quotation. */
  price: string;
  /** Время цены закрытия в ISO-формате или пустая строка. */
  time: string;
}

/** Отчет команды `marketdata get-close-prices` на application/output boundary. */
export type ClosePricesReport = ClosePricesReportPrice[];
