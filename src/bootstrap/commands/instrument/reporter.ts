/**
 * Модуль CLI-репортинга команды `instruments get-instrument-by`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  InstrumentReport,
  InstrumentReportInstrument
} from '../../../application/reports';
import {
  instrumentTypeToJSON,
  securityTradingStatusToJSON
} from '../../../generated/common';
import type {
  Instrument,
  InstrumentResponse
} from '../../../generated/instruments';
import { realExchangeToJSON } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const instrumentFormats = ['json', 'table'] as const;

export type InstrumentFormat = typeof instrumentFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function toReportInstrument(instrument: Instrument): InstrumentReportInstrument {
  return {
    figi: instrument.figi,
    ticker: instrument.ticker,
    classCode: instrument.classCode,
    isin: instrument.isin,
    uid: instrument.uid,
    positionUid: instrument.positionUid,
    name: instrument.name,
    instrumentType: instrument.instrumentType,
    instrumentKind: instrumentTypeToJSON(instrument.instrumentKind),
    currency: instrument.currency,
    lot: instrument.lot,
    exchange: instrument.exchange,
    realExchange: realExchangeToJSON(instrument.realExchange),
    tradingStatus: securityTradingStatusToJSON(instrument.tradingStatus),
    countryOfRisk: instrument.countryOfRisk,
    countryOfRiskName: instrument.countryOfRiskName,
    otcFlag: instrument.otcFlag,
    buyAvailableFlag: instrument.buyAvailableFlag,
    sellAvailableFlag: instrument.sellAvailableFlag,
    apiTradeAvailableFlag: instrument.apiTradeAvailableFlag,
    shortEnabledFlag: instrument.shortEnabledFlag,
    forIisFlag: instrument.forIisFlag,
    forQualInvestorFlag: instrument.forQualInvestorFlag,
    weekendFlag: instrument.weekendFlag,
    blockedTcaFlag: instrument.blockedTcaFlag,
    first1minCandleDate: formatDate(instrument.first1minCandleDate),
    first1dayCandleDate: formatDate(instrument.first1dayCandleDate)
  };
}

export function createInstrumentReport(response: InstrumentResponse): InstrumentReport {
  return response.instrument === undefined ? null : toReportInstrument(response.instrument);
}

export function formatInstrumentReport(report: InstrumentReport, format: InstrumentFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  const rows = report === null ? [] : [[
    report.figi,
    report.ticker,
    report.classCode,
    report.uid,
    report.positionUid,
    report.name,
    report.instrumentType,
    report.currency,
    String(report.lot),
    report.exchange,
    report.tradingStatus,
    String(report.buyAvailableFlag),
    String(report.sellAvailableFlag)
  ]];

  return renderTextTable([
    [
      'figi',
      'ticker',
      'classCode',
      'uid',
      'positionUid',
      'name',
      'instrumentType',
      'currency',
      'lot',
      'exchange',
      'tradingStatus',
      'buyAvailableFlag',
      'sellAvailableFlag'
    ],
    ...rows
  ]);
}

export function formatInstrument(response: InstrumentResponse, format: InstrumentFormat): string {
  return formatInstrumentReport(createInstrumentReport(response), format);
}
