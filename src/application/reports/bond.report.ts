/** Одна облигация в отчете команд `instruments bond-by` и `instruments bonds`. */
export interface BondReportInstrument {
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
  couponQuantityPerYear: number;
  maturityDate: string;
  nominal: string;
  initialNominal: string;
  stateRegDate: string;
  placementDate: string;
  placementPrice: string;
  aciValue: string;
  issueKind: string;
  issueSize: number;
  issueSizePlan: number;
  klong: string;
  kshort: string;
  dlong: string;
  dshort: string;
  dlongMin: string;
  dshortMin: string;
  minPriceIncrement: string;
  tradingStatus: string;
  riskLevel: string;
  countryOfRisk: string;
  countryOfRiskName: string;
  otcFlag: boolean;
  buyAvailableFlag: boolean;
  sellAvailableFlag: boolean;
  floatingCouponFlag: boolean;
  perpetualFlag: boolean;
  amortizationFlag: boolean;
  apiTradeAvailableFlag: boolean;
  shortEnabledFlag: boolean;
  forIisFlag: boolean;
  forQualInvestorFlag: boolean;
  weekendFlag: boolean;
  blockedTcaFlag: boolean;
  subordinatedFlag: boolean;
  liquidityFlag: boolean;
  first1minCandleDate: string;
  first1dayCandleDate: string;
}

/** Отчет команды `instruments bond-by` на application/output boundary. */
export type BondReport = BondReportInstrument | null;

/** Отчет команды `instruments bonds` на application/output boundary. */
export type BondsReport = BondReportInstrument[];
