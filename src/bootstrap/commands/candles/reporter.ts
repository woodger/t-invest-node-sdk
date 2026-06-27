/**
 * Модуль CLI-репортинга команды `marketdata get-candles`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { CandlesReport, CandlesReportCandle } from '../../../application/reports';
import type { Quotation } from '../../../generated/common';
import type { HistoricCandle } from '../../../generated/marketdata';
import { renderCsvRow } from '../../../infrastructure/renderers/csv-renderer';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';

export const candlesFormats = ['json', 'csv'] as const;

export type CandlesFormat = typeof candlesFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function formatQuotation(value: Quotation | undefined): string {
  if (value === undefined) {
    return '';
  }

  return String(value.units + value.nano / 1e9);
}

function toReportCandle(candle: HistoricCandle): CandlesReportCandle {
  return {
    time: formatDate(candle.time),
    open: formatQuotation(candle.open),
    high: formatQuotation(candle.high),
    low: formatQuotation(candle.low),
    close: formatQuotation(candle.close),
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

  return [
    'time,open,high,low,close,volume,isComplete',
    ...report.map((candle) => renderCsvRow([
      candle.time,
      candle.open,
      candle.high,
      candle.low,
      candle.close,
      candle.volume,
      candle.isComplete
    ])),
    ''
  ].join('\n');
}

export function formatCandles(candles: HistoricCandle[], format: CandlesFormat): string {
  return formatCandlesReport(createCandlesReport(candles), format);
}
