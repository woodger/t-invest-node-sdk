/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Основная информация об инструменте в отчете команды `instruments get-instrument-by`. */
export interface InstrumentReportInstrument {
  figi: string;
  ticker: string;
  classCode: string;
  isin: string;
  uid: string;
  positionUid: string;
  name: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  /** Вид инструмента в формате generated enum JSON name. */
  instrumentKind: string;
  currency: string;
  lot: number;
  exchange: string;
  /** Реальная площадка исполнения в формате generated enum JSON name. */
  realExchange: string;
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
  /** Дата первой минутной свечи в ISO-формате или пустая строка. */
  first1minCandleDate: string;
  /** Дата первой дневной свечи в ISO-формате или пустая строка. */
  first1dayCandleDate: string;
}

/** Отчет команды `instruments get-instrument-by` на application/output boundary. */
export type InstrumentReport = InstrumentReportInstrument | null;
