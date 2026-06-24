/** Одна облигация в отчете команд `instruments bond-by` и `instruments bonds`. */
export interface BondReportInstrument {
  /** FIGI облигации. */
  figi: string;
  /** Тикер облигации. */
  ticker: string;
  /** Class code облигации. */
  classCode: string;
  /** ISIN облигации. */
  isin: string;
  /** UID облигации. */
  uid: string;
  /** UID позиции облигации. */
  positionUid: string;
  /** Название облигации. */
  name: string;
  /** Валюта расчетов. */
  currency: string;
  /** Лотность облигации. */
  lot: number;
  /** Торговая площадка. */
  exchange: string;
  /** Реальная площадка исполнения в формате generated enum JSON name. */
  realExchange: string;
  /** Сектор экономики. */
  sector: string;
  /** Количество купонов в год. */
  couponQuantityPerYear: number;
  /** Дата погашения в ISO-формате или пустая строка. */
  maturityDate: string;
  /** Номинал в денежном строковом формате отчета. */
  nominal: string;
  /** Первоначальный номинал в денежном строковом формате отчета. */
  initialNominal: string;
  /** Дата государственной регистрации в ISO-формате или пустая строка. */
  stateRegDate: string;
  /** Дата размещения в ISO-формате или пустая строка. */
  placementDate: string;
  /** Цена размещения в денежном строковом формате отчета. */
  placementPrice: string;
  /** НКД в денежном строковом формате отчета. */
  aciValue: string;
  /** Вид выпуска. */
  issueKind: string;
  /** Размер выпуска. */
  issueSize: number;
  /** Плановый размер выпуска. */
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
  /** Минимальный шаг цены. */
  minPriceIncrement: string;
  /** Торговый статус в формате generated enum JSON name. */
  tradingStatus: string;
  /** Уровень риска в формате generated enum JSON name. */
  riskLevel: string;
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
  /** Признак плавающего купона. */
  floatingCouponFlag: boolean;
  /** Признак бессрочной облигации. */
  perpetualFlag: boolean;
  /** Признак амортизации. */
  amortizationFlag: boolean;
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
  /** Признак субординированной облигации. */
  subordinatedFlag: boolean;
  /** Признак ликвидности. */
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
