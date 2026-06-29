/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Один фьючерс в отчете команд `instruments future-by` и `instruments futures`. */
export interface FutureReportInstrument {
  /** FIGI фьючерса. */
  figi: string;
  /** Тикер фьючерса. */
  ticker: string;
  /** Class code фьючерса. */
  classCode: string;
  /** UID фьючерса. */
  uid: string;
  /** UID позиции фьючерса. */
  positionUid: string;
  /** Название фьючерса. */
  name: string;
  /** Валюта расчетов. */
  currency: string;
  /** Лотность фьючерса. */
  lot: number;
  /** Торговая площадка. */
  exchange: string;
  /** Реальная площадка исполнения в формате generated enum JSON name. */
  realExchange: string;
  /** Сектор экономики. */
  sector: string;
  /** Дата начала торгов в ISO-формате или пустая строка. */
  firstTradeDate: string;
  /** Дата последнего дня торгов в ISO-формате или пустая строка. */
  lastTradeDate: string;
  /** Дата экспирации в ISO-формате или пустая строка. */
  expirationDate: string;
  /** Тип фьючерса. */
  futuresType: string;
  /** Тип базового актива. */
  assetType: string;
  /** Базовый актив. */
  basicAsset: string;
  /** Размер базового актива в строковом формате quotation. */
  basicAssetSize: string;
  /** UID позиции базового актива. */
  basicAssetPositionUid: string;
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
  /** Признак внебиржевого инструмента. */
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
  /** Дата первой минутной свечи в ISO-формате или пустая строка. */
  first1minCandleDate: string;
  /** Дата первой дневной свечи в ISO-формате или пустая строка. */
  first1dayCandleDate: string;
}

/** Отчет команды `instruments future-by` на application/output boundary. */
export type FutureReport = FutureReportInstrument | null;

/** Отчет команды `instruments futures` на application/output boundary. */
export type FuturesReport = FutureReportInstrument[];
