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
