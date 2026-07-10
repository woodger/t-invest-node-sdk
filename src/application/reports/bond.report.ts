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
  /** Реальная площадка исполнения в формате generated enum JSON name. */
  realExchange: string;
  sector: string;
  couponQuantityPerYear: number;
  /** Дата погашения в ISO-формате или пустая строка. */
  maturityDate: string;
  /** Номинал или `null`, если provider не вернул значение. */
  nominal: ReportMoney | null;
  /** Первоначальный номинал или `null`, если provider не вернул значение. */
  initialNominal: ReportMoney | null;
  /** Дата государственной регистрации в ISO-формате или пустая строка. */
  stateRegDate: string;
  /** Дата размещения в ISO-формате или пустая строка. */
  placementDate: string;
  /** Цена размещения или `null`, если provider не вернул значение. */
  placementPrice: ReportMoney | null;
  /** НКД или `null`, если provider не вернул значение. */
  aciValue: ReportMoney | null;
  /** Вид выпуска. */
  issueKind: string;
  issueSize: number;
  issueSizePlan: number;
  /** Коэффициент ставки риска long. */
  klong: string;
  /** Коэффициент ставки риска short. */
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
  /** Уровень риска в формате generated enum JSON name. */
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
  /** Дата первой минутной свечи в ISO-формате или пустая строка. */
  first1minCandleDate: string;
  /** Дата первой дневной свечи в ISO-формате или пустая строка. */
  first1dayCandleDate: string;
}

/** Отчет команды `instruments bond-by` на application/output boundary. */
export type BondReport = BondReportInstrument | null;

/** Отчет команды `instruments bonds` на application/output boundary. */
export type BondsReport = BondReportInstrument[];
