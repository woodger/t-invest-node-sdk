/** Один фьючерс в отчете команд `instruments future-by` и `instruments futures`. */
export interface FutureReportInstrument {
  figi: string;
  ticker: string;
  classCode: string;
  uid: string;
  positionUid: string;
  name: string;
  currency: string;
  lot: number;
  exchange: string;
  realExchange: string;
  sector: string;
  firstTradeDate: string;
  lastTradeDate: string;
  expirationDate: string;
  futuresType: string;
  assetType: string;
  basicAsset: string;
  basicAssetSize: string;
  basicAssetPositionUid: string;
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
  first1minCandleDate: string;
  first1dayCandleDate: string;
}

/** Отчет команды `instruments future-by` на application/output boundary. */
export type FutureReport = FutureReportInstrument | null;

/** Отчет команды `instruments futures` на application/output boundary. */
export type FuturesReport = FutureReportInstrument[];
