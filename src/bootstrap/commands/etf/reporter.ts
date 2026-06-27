/**
 * Модуль CLI-репортинга команды `instruments etf-by`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  EtfReport,
  EtfReportInstrument
} from '../../../application/reports';
import {
  securityTradingStatusToJSON,
  type MoneyValue,
  type Quotation
} from '../../../generated/common';
import type {
  Etf,
  EtfResponse
} from '../../../generated/instruments';
import { realExchangeToJSON } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const etfFormats = ['json', 'table'] as const;

export type EtfFormat = typeof etfFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function formatDecimal(value: MoneyValue | Quotation | undefined): string {
  if (value === undefined) {
    return '';
  }

  return String(value.units + value.nano / 1e9);
}

export function createEtfReportInstrument(instrument: Etf): EtfReportInstrument {
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
    focusType: instrument.focusType,
    rebalancingFreq: instrument.rebalancingFreq,
    fixedCommission: formatDecimal(instrument.fixedCommission),
    releasedDate: formatDate(instrument.releasedDate),
    numShares: formatDecimal(instrument.numShares),
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

export function createEtfReport(response: EtfResponse): EtfReport {
  return response.instrument === undefined ? null : createEtfReportInstrument(response.instrument);
}

export function renderEtfRows(report: EtfReportInstrument[]): string {
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
      'focusType',
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
      instrument.focusType,
      instrument.tradingStatus,
      String(instrument.buyAvailableFlag),
      String(instrument.sellAvailableFlag),
      String(instrument.apiTradeAvailableFlag)
    ])
  ]);
}

export function formatEtfReport(report: EtfReport, format: EtfFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderEtfRows(report === null ? [] : [report]);
}

export function formatEtf(response: EtfResponse, format: EtfFormat): string {
  return formatEtfReport(createEtfReport(response), format);
}
