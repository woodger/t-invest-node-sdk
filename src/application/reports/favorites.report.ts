/** Один избранный инструмент в отчете команды `instruments get-favorites`. */
export interface FavoritesReportInstrument {
  /** FIGI инструмента. */
  figi: string;
  /** Тикер инструмента. */
  ticker: string;
  /** Class code инструмента. */
  classCode: string;
  /** ISIN инструмента. */
  isin: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  /** Вид инструмента в формате generated enum JSON name. */
  instrumentKind: string;
  /** Признак внебиржевого инструмента. */
  otcFlag: boolean;
  /** Признак доступности торговли через API. */
  apiTradeAvailableFlag: boolean;
}

/** Отчет команды `instruments get-favorites` на application/output boundary. */
export type FavoritesReport = FavoritesReportInstrument[];
