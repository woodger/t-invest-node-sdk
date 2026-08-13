/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

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
  /** Реальная площадка исполнения в формате generated enum JSON name. */
  realExchange: string;
  sector: string;
  focusType: string;
  rebalancingFreq: string;
  fixedCommission: string;
  /** Дата выпуска в ISO-формате или пустая строка. */
  releasedDate: string;
  numShares: string;
  /**
   * Коэффициент ставки риска long.
   * @deprecated В исходном контракте поле помечено как устаревшее. Оно
   * сохраняется для совместимости вывода CLI; `dlong` не является прямой заменой.
   */
  klong: string;
  /**
   * Коэффициент ставки риска short.
   * @deprecated В исходном контракте поле помечено как устаревшее. Оно
   * сохраняется для совместимости вывода CLI; `dshort` не является прямой заменой.
   */
  kshort: string;
  /** Ставка риска long. */
  dlong: string;
  /** Ставка риска short. */
  dshort: string;
  /** Минимальная ставка риска long. */
  dlongMin: string;
  /** Минимальная ставка риска short. */
  dshortMin: string;
  minPriceIncrement: string;
  /** Торговый статус в формате generated enum JSON name. */
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
  /** Дата первой минутной свечи в ISO-формате или пустая строка. */
  first1minCandleDate: string;
  /** Дата первой дневной свечи в ISO-формате или пустая строка. */
  first1dayCandleDate: string;
}

/** Отчет команды `instruments etf-by` на application/output boundary. */
export type EtfReport = EtfReportInstrument | null;

/** Отчет команды `instruments etfs` на application/output boundary. */
export type EtfsReport = EtfReportInstrument[];
