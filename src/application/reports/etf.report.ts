/** Один ETF в отчете команд `instruments etf-by` и `instruments etfs`. */
export interface EtfReportInstrument {
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
  focusType: string;
  rebalancingFreq: string;
  fixedCommission: string;
  releasedDate: string;
  numShares: string;
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

/** Отчет команды `instruments etf-by` на application/output boundary. */
export type EtfReport = EtfReportInstrument | null;

/** Отчет команды `instruments etfs` на application/output boundary. */
export type EtfsReport = EtfReportInstrument[];
