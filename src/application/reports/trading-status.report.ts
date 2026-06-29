/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Отчет команды `marketdata get-trading-status` на application/output boundary. */
export interface TradingStatusReport {
  /** FIGI инструмента. */
  figi: string;
  /** UID инструмента. */
  instrumentUid: string;
  /** Торговый статус в формате generated enum JSON name. */
  tradingStatus: string;
  /** Признак доступности лимитных заявок. */
  limitOrderAvailable: boolean;
  /** Признак доступности рыночных заявок. */
  marketOrderAvailable: boolean;
  /** Признак доступности торговли через API. */
  apiTradeAvailable: boolean;
}
