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
  figi: string;
  ticker: string;
  classCode: string;
  uid: string;
  positionUid: string;
  name: string;
  currency: string;
  lot: number;
  exchange: string;
  /** Реальная площадка исполнения в формате generated enum JSON name. */
  realExchange: string;
  sector: string;
  /** Дата начала торгов в ISO-формате или пустая строка. */
  firstTradeDate: string;
  /** Дата последнего дня торгов в ISO-формате или пустая строка. */
  lastTradeDate: string;
  /** Дата экспирации в ISO-формате или пустая строка. */
  expirationDate: string;
  futuresType: string;
  assetType: string;
  basicAsset: string;
  /** Размер базового актива в строковом формате quotation. */
  basicAssetSize: string;
  basicAssetPositionUid: string;
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
  /** Дата первой минутной свечи в ISO-формате или пустая строка. */
  first1minCandleDate: string;
  /** Дата первой дневной свечи в ISO-формате или пустая строка. */
  first1dayCandleDate: string;
}

/** Отчет команды `instruments future-by` на application/output boundary. */
export type FutureReport = FutureReportInstrument | null;

/** Отчет команды `instruments futures` на application/output boundary. */
export type FuturesReport = FutureReportInstrument[];
