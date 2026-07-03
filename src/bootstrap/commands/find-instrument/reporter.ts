/**
 * Модуль CLI-репортинга команды `instruments find-instrument`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  FindInstrumentReport,
  FindInstrumentReportInstrument
} from '../../../application/reports';
import { instrumentTypeToJSON } from '../../../generated/common';
import type { InstrumentShort } from '../../../generated/instruments';
import {
  formatReportDate
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const findInstrumentFormats = ['json', 'table'] as const;

export type FindInstrumentFormat = typeof findInstrumentFormats[number];

function toReportInstrument(instrument: InstrumentShort): FindInstrumentReportInstrument {
  return {
    isin: instrument.isin,
    figi: instrument.figi,
    ticker: instrument.ticker,
    classCode: instrument.classCode,
    instrumentType: instrument.instrumentType,
    name: instrument.name,
    uid: instrument.uid,
    positionUid: instrument.positionUid,
    instrumentKind: instrumentTypeToJSON(instrument.instrumentKind),
    apiTradeAvailableFlag: instrument.apiTradeAvailableFlag,
    forIisFlag: instrument.forIisFlag,
    forQualInvestorFlag: instrument.forQualInvestorFlag,
    weekendFlag: instrument.weekendFlag,
    blockedTcaFlag: instrument.blockedTcaFlag,
    first1minCandleDate: formatReportDate(instrument.first1minCandleDate),
    first1dayCandleDate: formatReportDate(instrument.first1dayCandleDate)
  };
}

export function createFindInstrumentReport(instruments: InstrumentShort[]): FindInstrumentReport {
  return instruments.map(toReportInstrument);
}

export function formatFindInstrumentReport(
  report: FindInstrumentReport,
  format: FindInstrumentFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    [
      'figi',
      'ticker',
      'classCode',
      'name',
      'uid',
      'positionUid',
      'instrumentType',
      'instrumentKind',
      'apiTradeAvailableFlag'
    ],
    ...report.map((instrument) => [
      instrument.figi,
      instrument.ticker,
      instrument.classCode,
      instrument.name,
      instrument.uid,
      instrument.positionUid,
      instrument.instrumentType,
      instrument.instrumentKind,
      String(instrument.apiTradeAvailableFlag)
    ])
  ]);
}

export function formatFindInstrument(
  instruments: InstrumentShort[],
  format: FindInstrumentFormat
): string {
  return formatFindInstrumentReport(createFindInstrumentReport(instruments), format);
}
