/**
 * Модуль CLI-репортинга команды `instrument future show`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  FutureReport,
  FutureReportInstrument
} from '../../../application/reports';
import { securityTradingStatusToJSON } from '../../../generated/common';
import type {
  Future,
  FutureResponse
} from '../../../generated/instruments';
import { realExchangeToJSON } from '../../../generated/instruments';
import {
  formatReportDate,
  formatReportQuotation
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const futureFormats = ['json', 'table'] as const;

export type FutureFormat = typeof futureFormats[number];

export function createFutureReportInstrument(instrument: Future): FutureReportInstrument {
  return {
    figi: instrument.figi,
    ticker: instrument.ticker,
    classCode: instrument.classCode,
    uid: instrument.uid,
    positionUid: instrument.positionUid,
    name: instrument.name,
    currency: instrument.currency,
    lot: instrument.lot,
    exchange: instrument.exchange,
    realExchange: realExchangeToJSON(instrument.realExchange),
    sector: instrument.sector,
    firstTradeDate: formatReportDate(instrument.firstTradeDate),
    lastTradeDate: formatReportDate(instrument.lastTradeDate),
    expirationDate: formatReportDate(instrument.expirationDate),
    futuresType: instrument.futuresType,
    assetType: instrument.assetType,
    basicAsset: instrument.basicAsset,
    basicAssetSize: formatReportQuotation(instrument.basicAssetSize),
    basicAssetPositionUid: instrument.basicAssetPositionUid,
    klong: formatReportQuotation(instrument.klong),
    kshort: formatReportQuotation(instrument.kshort),
    dlong: formatReportQuotation(instrument.dlong),
    dshort: formatReportQuotation(instrument.dshort),
    dlongMin: formatReportQuotation(instrument.dlongMin),
    dshortMin: formatReportQuotation(instrument.dshortMin),
    minPriceIncrement: formatReportQuotation(instrument.minPriceIncrement),
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
    first1minCandleDate: formatReportDate(instrument.first1minCandleDate),
    first1dayCandleDate: formatReportDate(instrument.first1dayCandleDate)
  };
}

export function createFutureReport(response: FutureResponse): FutureReport {
  return response.instrument === undefined
    ? null
    : createFutureReportInstrument(response.instrument);
}

export function renderFutureRows(report: FutureReportInstrument[]): string {
  return renderTextTable([
    [
      'figi',
      'ticker',
      'classCode',
      'uid',
      'positionUid',
      'name',
      'currency',
      'lot',
      'exchange',
      'sector',
      'futuresType',
      'assetType',
      'expirationDate',
      'tradingStatus',
      'buyAvailableFlag',
      'sellAvailableFlag',
      'apiTradeAvailableFlag'
    ],
    ...report.map((instrument) => [
      instrument.figi,
      instrument.ticker,
      instrument.classCode,
      instrument.uid,
      instrument.positionUid,
      instrument.name,
      instrument.currency,
      String(instrument.lot),
      instrument.exchange,
      instrument.sector,
      instrument.futuresType,
      instrument.assetType,
      instrument.expirationDate,
      instrument.tradingStatus,
      String(instrument.buyAvailableFlag),
      String(instrument.sellAvailableFlag),
      String(instrument.apiTradeAvailableFlag)
    ])
  ]);
}

export function formatFutureReport(report: FutureReport, format: FutureFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderFutureRows(report === null ? [] : [report]);
}

export function formatFuture(response: FutureResponse, format: FutureFormat): string {
  return formatFutureReport(createFutureReport(response), format);
}
