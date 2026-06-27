/**
 * Модуль CLI-репортинга команды `instruments share-by`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  ShareReport,
  ShareReportInstrument
} from '../../../application/reports';
import {
  securityTradingStatusToJSON,
  type MoneyValue,
  type Quotation
} from '../../../generated/common';
import type {
  Share,
  ShareResponse
} from '../../../generated/instruments';
import {
  realExchangeToJSON,
  shareTypeToJSON
} from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const shareFormats = ['json', 'table'] as const;

export type ShareFormat = typeof shareFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function formatDecimal(value: MoneyValue | Quotation | undefined): string {
  if (value === undefined) {
    return '';
  }

  return String(value.units + value.nano / 1e9);
}

function formatMoney(value: MoneyValue | undefined): string {
  if (value === undefined) {
    return '';
  }

  const amount = formatDecimal(value);

  return value.currency === '' ? amount : `${amount} ${value.currency}`;
}

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
    nominal: formatMoney(instrument.nominal),
    ipoDate: formatDate(instrument.ipoDate),
    issueSize: instrument.issueSize,
    issueSizePlan: instrument.issueSizePlan,
    shareType: shareTypeToJSON(instrument.shareType),
    klong: formatDecimal(instrument.klong),
    kshort: formatDecimal(instrument.kshort),
    dlong: formatDecimal(instrument.dlong),
    dshort: formatDecimal(instrument.dshort),
    dlongMin: formatDecimal(instrument.dlongMin),
    dshortMin: formatDecimal(instrument.dshortMin),
    minPriceIncrement: formatDecimal(instrument.minPriceIncrement),
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
    first1minCandleDate: formatDate(instrument.first1minCandleDate),
    first1dayCandleDate: formatDate(instrument.first1dayCandleDate)
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
