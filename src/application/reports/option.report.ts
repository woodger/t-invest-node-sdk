/** Один опцион в отчете команд `instruments option-by` и `instruments options-by`. */
export interface OptionReportInstrument {
  uid: string;
  positionUid: string;
  ticker: string;
  classCode: string;
  name: string;
  currency: string;
  settlementCurrency: string;
  lot: number;
  exchange: string;
  realExchange: string;
  sector: string;
  tradingStatus: string;
  direction: string;
  paymentType: string;
  style: string;
  settlementType: string;
  assetType: string;
  basicAsset: string;
  basicAssetSize: string;
  basicAssetPositionUid: string;
  strikePrice: string;
  expirationDate: string;
  firstTradeDate: string;
  lastTradeDate: string;
  klong: string;
  kshort: string;
  dlong: string;
  dshort: string;
  dlongMin: string;
  dshortMin: string;
  minPriceIncrement: string;
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

/** Отчет команды `instruments option-by` на application/output boundary. */
export type OptionReport = OptionReportInstrument | null;

/** Отчет команды `instruments options-by` на application/output boundary. */
export type OptionsByReport = OptionReportInstrument[];
