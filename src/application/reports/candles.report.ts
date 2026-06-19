/** Одна историческая свеча в отчете команды `candles`. */
export interface CandlesReportCandle {
  time: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: number;
  isComplete: boolean;
}

/** Отчет команды `candles` на application/output boundary. */
export type CandlesReport = CandlesReportCandle[];
