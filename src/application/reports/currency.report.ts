/** Одна валюта в отчете команд `instruments currency-by` и `instruments currencies`. */
export interface CurrencyReportInstrument {
  figi: string;
  ticker: string;
  classCode: string;
  isin: string;
  uid: string;
  positionUid: string;
  name: string;
  currency: string;
  isoCurrencyName: string;
  lot: number;
  exchange: string;
  realExchange: string;
  nominal: string;
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

/** Отчет команды `instruments currency-by` на application/output boundary. */
export type CurrencyReport = CurrencyReportInstrument | null;

/** Отчет команды `instruments currencies` на application/output boundary. */
export type CurrenciesReport = CurrencyReportInstrument[];
