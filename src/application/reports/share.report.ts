/** Одна акция в отчете команд `instruments share-by` и `instruments shares`. */
export interface ShareReportInstrument {
  /** FIGI акции. */
  figi: string;
  /** Тикер акции. */
  ticker: string;
  /** Class code акции. */
  classCode: string;
  /** ISIN акции. */
  isin: string;
  /** UID акции. */
  uid: string;
  /** UID позиции акции. */
  positionUid: string;
  /** Название акции. */
  name: string;
  /** Валюта расчетов. */
  currency: string;
  /** Лотность акции. */
  lot: number;
  /** Торговая площадка. */
  exchange: string;
  /** Реальная площадка исполнения в формате generated enum JSON name. */
  realExchange: string;
  /** Сектор экономики. */
  sector: string;
  /** Номинал в денежном строковом формате отчета. */
  nominal: string;
  /** Дата IPO в ISO-формате или пустая строка. */
  ipoDate: string;
  /** Размер выпуска. */
  issueSize: number;
  /** Плановый размер выпуска. */
  issueSizePlan: number;
  /** Тип акции в формате generated enum JSON name. */
  shareType: string;
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
  /** Признак наличия дивидендной доходности. */
  divYieldFlag: boolean;
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

/** Отчет команды `instruments share-by` на application/output boundary. */
export type ShareReport = ShareReportInstrument | null;

/** Отчет команды `instruments shares` на application/output boundary. */
export type SharesReport = ShareReportInstrument[];
