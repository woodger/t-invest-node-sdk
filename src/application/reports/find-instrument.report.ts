/** Один найденный инструмент в отчете команды `instruments find-instrument`. */
export interface FindInstrumentReportInstrument {
  isin: string;
  figi: string;
  ticker: string;
  classCode: string;
  instrumentType: string;
  name: string;
  uid: string;
  positionUid: string;
  instrumentKind: string;
  apiTradeAvailableFlag: boolean;
  forIisFlag: boolean;
  forQualInvestorFlag: boolean;
  weekendFlag: boolean;
  blockedTcaFlag: boolean;
  first1minCandleDate: string;
  first1dayCandleDate: string;
}

/** Отчет команды `instruments find-instrument` на application/output boundary. */
export type FindInstrumentReport = FindInstrumentReportInstrument[];
