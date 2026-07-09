/**
 * Модуль CLI-репортинга команды `instrument share show`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  ShareReport,
  ShareReportInstrument
} from '../../../application/reports';
import { realExchangeToJSON, securityTradingStatusToJSON } from '../../../generated/t_tech/invest/grpc/common';
import type {
  Share,
  ShareResponse
} from '../../../generated/t_tech/invest/grpc/instruments';
import { shareTypeToJSON } from '../../../generated/t_tech/invest/grpc/instruments';
import {
  formatReportDate,
  formatReportDecimal,
  toReportMoney
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const shareFormats = ['json', 'table'] as const;

export type ShareFormat = typeof shareFormats[number];

export function createShareReportInstrument(instrument: Share): ShareReportInstrument {
  return {
    figi: instrument.figi,
    ticker: instrument.ticker,
    classCode: instrument.classCode,
    isin: instrument.isin,
    uid: instrument.uid,
    positionUid: instrument.positionUid,
    name: instrument.name,
    currency: instrument.currency,
    lot: instrument.lot,
    exchange: instrument.exchange,
    realExchange: realExchangeToJSON(instrument.realExchange),
    sector: instrument.sector,
    nominal: toReportMoney(instrument.nominal),
    ipoDate: formatReportDate(instrument.ipoDate),
    issueSize: instrument.issueSize,
    issueSizePlan: instrument.issueSizePlan,
    shareType: shareTypeToJSON(instrument.shareType),
    klong: formatReportDecimal(instrument.klong),
    kshort: formatReportDecimal(instrument.kshort),
    dlong: formatReportDecimal(instrument.dlong),
    dshort: formatReportDecimal(instrument.dshort),
    dlongMin: formatReportDecimal(instrument.dlongMin),
    dshortMin: formatReportDecimal(instrument.dshortMin),
    minPriceIncrement: formatReportDecimal(instrument.minPriceIncrement),
    tradingStatus: securityTradingStatusToJSON(instrument.tradingStatus),
    countryOfRisk: instrument.countryOfRisk,
    countryOfRiskName: instrument.countryOfRiskName,
    otcFlag: instrument.otcFlag,
    buyAvailableFlag: instrument.buyAvailableFlag,
    sellAvailableFlag: instrument.sellAvailableFlag,
    divYieldFlag: instrument.divYieldFlag,
    apiTradeAvailableFlag: instrument.apiTradeAvailableFlag,
    shortEnabledFlag: instrument.shortEnabledFlag,
    forIisFlag: instrument.forIisFlag,
    forQualInvestorFlag: instrument.forQualInvestorFlag,
    weekendFlag: instrument.weekendFlag,
    blockedTcaFlag: instrument.blockedTcaFlag,
    liquidityFlag: instrument.liquidityFlag,
    first1minCandleDate: formatReportDate(instrument.first1minCandleDate),
    first1dayCandleDate: formatReportDate(instrument.first1dayCandleDate)
  };
}

export function createShareReport(response: ShareResponse): ShareReport {
  return response.instrument === undefined ? null : createShareReportInstrument(response.instrument);
}

export function renderShareRows(report: ShareReportInstrument[]): string {
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
      'shareType',
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
      instrument.shareType,
      instrument.tradingStatus,
      String(instrument.buyAvailableFlag),
      String(instrument.sellAvailableFlag),
      String(instrument.apiTradeAvailableFlag)
    ])
  ]);
}

export function formatShareReport(report: ShareReport, format: ShareFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderShareRows(report === null ? [] : [report]);
}

export function formatShare(response: ShareResponse, format: ShareFormat): string {
  return formatShareReport(createShareReport(response), format);
}
