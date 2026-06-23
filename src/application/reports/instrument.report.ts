/** Основная информация об инструменте в отчете команды `instruments get-instrument-by`. */
export interface InstrumentReportInstrument {
  figi: string;
  ticker: string;
  classCode: string;
  isin: string;
  uid: string;
  positionUid: string;
  name: string;
  instrumentType: string;
  instrumentKind: string;
  currency: string;
  lot: number;
  exchange: string;
  realExchange: string;
  tradingStatus: string;
  countryOfRisk: string;
  countryOfRiskName: string;
  otcFlag: boolean;
  buyAvailableFlag: boolean;
  sellAvailableFlag: boolean;
  apiTradeAvailableFlag: boolean;
  shortEnabledFlag: boolean;
  forIisFlag: boolean;
  forQualInvestorFlag: boolean;
  weekendFlag: boolean;
  blockedTcaFlag: boolean;
  first1minCandleDate: string;
  first1dayCandleDate: string;
}

/** Отчет команды `instruments get-instrument-by` на application/output boundary. */
export type InstrumentReport = InstrumentReportInstrument | null;
