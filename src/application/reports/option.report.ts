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
  /** UID опциона. */
  uid: string;
  /** UID позиции опциона. */
  positionUid: string;
  /** Тикер опциона. */
  ticker: string;
  /** Class code опциона. */
  classCode: string;
  /** Название опциона. */
  name: string;
  /** Валюта расчетов. */
  currency: string;
  /** Валюта оценки контракта. */
  settlementCurrency: string;
  /** Лотность опциона. */
  lot: number;
  /** Торговая площадка. */
  exchange: string;
  /** Реальная площадка исполнения в формате generated enum JSON name. */
  realExchange: string;
  /** Сектор экономики. */
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
  /** Тип базового актива. */
  assetType: string;
  /** Базовый актив. */
  basicAsset: string;
  /** Размер базового актива в строковом формате quotation. */
  basicAssetSize: string;
  /** UID позиции базового актива. */
  basicAssetPositionUid: string;
  /** Цена страйка или `null`, если provider не вернул значение. */
  strikePrice: ReportMoney | null;
  /** Дата экспирации в ISO-формате или пустая строка. */
  expirationDate: string;
  /** Дата начала торгов в ISO-формате или пустая строка. */
  firstTradeDate: string;
  /** Дата последнего дня торгов в ISO-формате или пустая строка. */
  lastTradeDate: string;
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

/** Отчет команды `instruments option-by` на application/output boundary. */
export type OptionReport = OptionReportInstrument | null;

/** Отчет команды `instruments options-by` на application/output boundary. */
export type OptionsByReport = OptionReportInstrument[];
