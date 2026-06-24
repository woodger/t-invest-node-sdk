/** Один найденный инструмент в отчете команды `instruments find-instrument`. */
export interface FindInstrumentReportInstrument {
  /** ISIN инструмента. */
  isin: string;
  /** FIGI инструмента. */
  figi: string;
  /** Тикер инструмента. */
  ticker: string;
  /** Class code инструмента. */
  classCode: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  /** Название инструмента. */
  name: string;
  /** UID инструмента. */
  uid: string;
  /** UID позиции инструмента. */
  positionUid: string;
  /** Вид инструмента в формате generated enum JSON name. */
  instrumentKind: string;
  /** Признак доступности торговли через API. */
  apiTradeAvailableFlag: boolean;
  /** Признак доступности для ИИС. */
  forIisFlag: boolean;
  /** Признак инструмента для квалифицированных инвесторов. */
  forQualInvestorFlag: boolean;
  /** Признак доступности торговли по выходным. */
  weekendFlag: boolean;
  /** Признак блокировки ТКС. */
  blockedTcaFlag: boolean;
  /** Дата первой минутной свечи в ISO-формате или пустая строка. */
  first1minCandleDate: string;
  /** Дата первой дневной свечи в ISO-формате или пустая строка. */
  first1dayCandleDate: string;
}

/** Отчет команды `instruments find-instrument` на application/output boundary. */
export type FindInstrumentReport = FindInstrumentReportInstrument[];
