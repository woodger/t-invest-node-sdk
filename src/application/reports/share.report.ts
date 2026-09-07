/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

import type { ReportMoney } from './money.report';

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
  /** Реальная площадка исполнения в формате generated enum JSON name. */
  realExchange: string;
  sector: string;
  /** Номинал или `null`, если provider не вернул значение. */
  nominal: ReportMoney | null;
  /** Дата IPO в ISO-формате или пустая строка. */
  ipoDate: string;
  issueSize: number;
  issueSizePlan: number;
  /** Тип акции в формате generated enum JSON name. */
  shareType: string;
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
  divYieldFlag: boolean;
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

/** Отчет команды `instruments share-by` на application/output boundary. */
export type ShareReport = ShareReportInstrument | null;

/** Отчет команды `instruments shares` на application/output boundary. */
export type SharesReport = ShareReportInstrument[];
