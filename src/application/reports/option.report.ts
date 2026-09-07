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

/** Один опцион в отчете команд `instruments option-by` и `instruments options-by`. */
export interface OptionReportInstrument {
  uid: string;
  positionUid: string;
  ticker: string;
  classCode: string;
  name: string;
  currency: string;
  settlementCurrency: string;
  lot: number;
  exchange: string;
  /** Реальная площадка исполнения в формате generated enum JSON name. */
  realExchange: string;
  sector: string;
  /** Торговый статус в формате generated enum JSON name. */
  tradingStatus: string;
  /** Направление опциона в формате generated enum JSON name. */
  direction: string;
  /** Тип расчетов по опциону в формате generated enum JSON name. */
  paymentType: string;
  /** Стиль опциона в формате generated enum JSON name. */
  style: string;
  /** Способ исполнения опциона в формате generated enum JSON name. */
  settlementType: string;
  assetType: string;
  basicAsset: string;
  /** Размер базового актива в строковом формате quotation. */
  basicAssetSize: string;
  basicAssetPositionUid: string;
  /** Цена страйка или `null`, если provider не вернул значение. */
  strikePrice: ReportMoney | null;
  /** Дата экспирации в ISO-формате или пустая строка. */
  expirationDate: string;
  /** Дата начала торгов в ISO-формате или пустая строка. */
  firstTradeDate: string;
  /** Дата последнего дня торгов в ISO-формате или пустая строка. */
  lastTradeDate: string;
  /** Ставка риска long. */
  dlong: string;
  /** Ставка риска short. */
  dshort: string;
  /** Минимальная ставка риска long. */
  dlongMin: string;
  /** Минимальная ставка риска short. */
  dshortMin: string;
  minPriceIncrement: string;
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

/** Отчет команды `instruments option-by` на application/output boundary. */
export type OptionReport = OptionReportInstrument | null;

/** Отчет команды `instruments options-by` на application/output boundary. */
export type OptionsByReport = OptionReportInstrument[];
