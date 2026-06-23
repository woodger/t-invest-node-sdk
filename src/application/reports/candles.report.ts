/** Одна историческая свеча в отчете команды `marketdata get-candles`. */
export interface CandlesReportCandle {
  time: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: number;
  isComplete: boolean;
}

/** Отчет команды `marketdata get-candles` на application/output boundary. */
export type CandlesReport = CandlesReportCandle[];
