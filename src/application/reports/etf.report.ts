/** Один ETF в отчете команд `instruments etf-by` и `instruments etfs`. */
export interface EtfReportInstrument {
  /** FIGI ETF. */
  figi: string;
  /** Тикер ETF. */
  ticker: string;
  /** Class code ETF. */
  classCode: string;
  /** ISIN ETF. */
  isin: string;
  /** UID ETF. */
  uid: string;
  /** UID позиции ETF. */
  positionUid: string;
  /** Название ETF. */
  name: string;
  /** Валюта расчетов. */
  currency: string;
  /** Лотность ETF. */
  lot: number;
  /** Торговая площадка. */
  exchange: string;
  /** Реальная площадка исполнения в формате generated enum JSON name. */
  realExchange: string;
  /** Сектор экономики. */
  sector: string;
  /** Фокус ETF. */
  focusType: string;
  /** Частота ребалансировки. */
  rebalancingFreq: string;
  /** Фиксированная комиссия. */
  fixedCommission: string;
  /** Дата выпуска в ISO-формате или пустая строка. */
  releasedDate: string;
  /** Количество паев. */
  numShares: string;
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
  /** Минимальный шаг цены. */
  minPriceIncrement: string;
  /** Торговый статус в формате generated enum JSON name. */
  tradingStatus: string;
  /** Код страны риска. */
  countryOfRisk: string;
  /** Название страны риска. */
  countryOfRiskName: string;
  /** Признак внебиржевой бумаги. */
  otcFlag: boolean;
  /** Признак доступности покупки. */
  buyAvailableFlag: boolean;
  /** Признак доступности продажи. */
  sellAvailableFlag: boolean;
  /** Признак доступности торговли через API. */
  apiTradeAvailableFlag: boolean;
  /** Признак доступности short-операций. */
  shortEnabledFlag: boolean;
  /** Признак доступности для ИИС. */
  forIisFlag: boolean;
  /** Признак инструмента для квалифицированных инвесторов. */
  forQualInvestorFlag: boolean;
  /** Признак доступности торговли по выходным. */
  weekendFlag: boolean;
  /** Признак блокировки ТКС. */
  blockedTcaFlag: boolean;
  /** Признак ликвидности. */
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
