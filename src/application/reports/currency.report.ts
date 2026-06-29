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

/** Одна валюта в отчете команд `instruments currency-by` и `instruments currencies`. */
export interface CurrencyReportInstrument {
  /** FIGI валюты. */
  figi: string;
  /** Тикер валюты. */
  ticker: string;
  /** Class code валюты. */
  classCode: string;
  /** ISIN валютного инструмента. */
  isin: string;
  /** UID валютного инструмента. */
  uid: string;
  /** UID позиции валютного инструмента. */
  positionUid: string;
  /** Название валютного инструмента. */
  name: string;
  /** Валюта расчетов. */
  currency: string;
  /** ISO-название валюты. */
  isoCurrencyName: string;
  /** Лотность валютного инструмента. */
  lot: number;
  /** Торговая площадка. */
  exchange: string;
  /** Реальная площадка исполнения в формате generated enum JSON name. */
  realExchange: string;
  /** Номинал или `null`, если provider не вернул значение. */
  nominal: ReportMoney | null;
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
  /** Дата первой минутной свечи в ISO-формате или пустая строка. */
  first1minCandleDate: string;
  /** Дата первой дневной свечи в ISO-формате или пустая строка. */
  first1dayCandleDate: string;
}

/** Отчет команды `instruments currency-by` на application/output boundary. */
export type CurrencyReport = CurrencyReportInstrument | null;

/** Отчет команды `instruments currencies` на application/output boundary. */
export type CurrenciesReport = CurrencyReportInstrument[];
