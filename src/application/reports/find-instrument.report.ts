/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Один найденный инструмент в отчете команды `instruments find-instrument`. */
export interface FindInstrumentReportInstrument {
  isin: string;
  figi: string;
  ticker: string;
  classCode: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  name: string;
  uid: string;
  positionUid: string;
  /** Вид инструмента в формате generated enum JSON name. */
  instrumentKind: string;
  apiTradeAvailableFlag: boolean;
  forIisFlag: boolean;
  forQualInvestorFlag: boolean;
  weekendFlag: boolean;
  blockedTcaFlag: boolean;
  /** Дата первой минутной свечи в ISO-формате или пустая строка. */
  first1minCandleDate: string;
  /** Дата первой дневной свечи в ISO-формате или пустая строка. */
  first1dayCandleDate: string;
}

/** Отчет команды `instruments find-instrument` на application/output boundary. */
export type FindInstrumentReport = FindInstrumentReportInstrument[];
