/**
 * Модуль CLI-репортинга команды `market candles`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { CandlesReport, CandlesReportCandle } from '../../../application/reports';
import type { HistoricCandle } from '../../../generated/marketdata';
import {
  formatReportDate,
  formatReportQuotation
} from '../../../infrastructure/report-values';
import { renderCsv, renderJson } from 'icore';

export const candlesFormats = ['json', 'csv'] as const;

export type CandlesFormat = typeof candlesFormats[number];

function toReportCandle(candle: HistoricCandle): CandlesReportCandle {
  return {
    time: formatReportDate(candle.time),
    open: formatReportQuotation(candle.open),
    high: formatReportQuotation(candle.high),
    low: formatReportQuotation(candle.low),
    close: formatReportQuotation(candle.close),
    volume: candle.volume,
    isComplete: candle.isComplete
  };
}

export function createCandlesReport(candles: HistoricCandle[]): CandlesReport {
  return candles.map(toReportCandle);
}

export function formatCandlesReport(report: CandlesReport, format: CandlesFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderCsv([
    ['time', 'open', 'high', 'low', 'close', 'volume', 'isComplete'],
    ...report.map((candle) => [
      candle.time,
      candle.open,
      candle.high,
      candle.low,
      candle.close,
      candle.volume,
      candle.isComplete
    ])
  ]);
}

export function formatCandles(candles: HistoricCandle[], format: CandlesFormat): string {
  return formatCandlesReport(createCandlesReport(candles), format);
}
