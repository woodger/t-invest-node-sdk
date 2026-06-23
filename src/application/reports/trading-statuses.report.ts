import type { TradingStatusReport } from './trading-status.report';

/** Отчет команды `marketdata get-trading-statuses` на application/output boundary. */
export type TradingStatusesReport = TradingStatusReport[];
