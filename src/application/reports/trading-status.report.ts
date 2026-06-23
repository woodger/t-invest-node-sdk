/** Отчет команды `marketdata get-trading-status` на application/output boundary. */
export interface TradingStatusReport {
  figi: string;
  instrumentUid: string;
  tradingStatus: string;
  limitOrderAvailable: boolean;
  marketOrderAvailable: boolean;
  apiTradeAvailable: boolean;
}
