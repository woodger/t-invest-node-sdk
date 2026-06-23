/** Один избранный инструмент в отчете команды `instruments get-favorites`. */
export interface FavoritesReportInstrument {
  figi: string;
  ticker: string;
  classCode: string;
  isin: string;
  instrumentType: string;
  instrumentKind: string;
  otcFlag: boolean;
  apiTradeAvailableFlag: boolean;
}

/** Отчет команды `instruments get-favorites` на application/output boundary. */
export type FavoritesReport = FavoritesReportInstrument[];
