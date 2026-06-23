/** Одна акция в отчете команд `instruments share-by` и `instruments shares`. */
export interface ShareReportInstrument {
  figi: string;
  ticker: string;
  classCode: string;
  isin: string;
  uid: string;
  positionUid: string;
  name: string;
  currency: string;
  lot: number;
  exchange: string;
  realExchange: string;
  sector: string;
  nominal: string;
  ipoDate: string;
  issueSize: number;
  issueSizePlan: number;
  shareType: string;
  klong: string;
  kshort: string;
  dlong: string;
  dshort: string;
  dlongMin: string;
  dshortMin: string;
  minPriceIncrement: string;
  tradingStatus: string;
  countryOfRisk: string;
  countryOfRiskName: string;
  otcFlag: boolean;
  buyAvailableFlag: boolean;
  sellAvailableFlag: boolean;
  divYieldFlag: boolean;
  apiTradeAvailableFlag: boolean;
  shortEnabledFlag: boolean;
  forIisFlag: boolean;
  forQualInvestorFlag: boolean;
  weekendFlag: boolean;
  blockedTcaFlag: boolean;
  liquidityFlag: boolean;
  first1minCandleDate: string;
  first1dayCandleDate: string;
}

/** Отчет команды `instruments share-by` на application/output boundary. */
export type ShareReport = ShareReportInstrument | null;

/** Отчет команды `instruments shares` на application/output boundary. */
export type SharesReport = ShareReportInstrument[];
