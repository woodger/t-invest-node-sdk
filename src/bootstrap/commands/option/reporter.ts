/**
 * Модуль CLI-репортинга команды `instrument option show`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  OptionReport,
  OptionReportInstrument
} from '../../../application/reports';
import { realExchangeToJSON, securityTradingStatusToJSON } from '../../../generated/common';
import type {
  Option,
  OptionResponse
} from '../../../generated/instruments';
import {
  optionDirectionToJSON,
  optionPaymentTypeToJSON,
  optionSettlementTypeToJSON,
  optionStyleToJSON
} from '../../../generated/instruments';
import {
  formatReportDate,
  formatReportDecimal,
  formatReportMoneyText,
  toReportMoney
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const optionFormats = ['json', 'table'] as const;

export type OptionFormat = typeof optionFormats[number];

export function createOptionReportInstrument(instrument: Option): OptionReportInstrument {
  return {
    uid: instrument.uid,
    positionUid: instrument.positionUid,
    ticker: instrument.ticker,
    classCode: instrument.classCode,
    name: instrument.name,
    currency: instrument.currency,
    settlementCurrency: instrument.settlementCurrency,
    lot: instrument.lot,
    exchange: instrument.exchange,
    realExchange: realExchangeToJSON(instrument.realExchange),
    sector: instrument.sector,
    tradingStatus: securityTradingStatusToJSON(instrument.tradingStatus),
    direction: optionDirectionToJSON(instrument.direction),
    paymentType: optionPaymentTypeToJSON(instrument.paymentType),
    style: optionStyleToJSON(instrument.style),
    settlementType: optionSettlementTypeToJSON(instrument.settlementType),
    assetType: instrument.assetType,
    basicAsset: instrument.basicAsset,
    basicAssetSize: formatReportDecimal(instrument.basicAssetSize),
    basicAssetPositionUid: instrument.basicAssetPositionUid,
    strikePrice: toReportMoney(instrument.strikePrice),
    expirationDate: formatReportDate(instrument.expirationDate),
    firstTradeDate: formatReportDate(instrument.firstTradeDate),
    lastTradeDate: formatReportDate(instrument.lastTradeDate),
    dlong: formatReportDecimal(instrument.dlong),
    dshort: formatReportDecimal(instrument.dshort),
    dlongMin: formatReportDecimal(instrument.dlongMin),
    dshortMin: formatReportDecimal(instrument.dshortMin),
    minPriceIncrement: formatReportDecimal(instrument.minPriceIncrement),
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

export function createOptionReport(response: OptionResponse): OptionReport {
  return response.instrument === undefined
    ? null
    : createOptionReportInstrument(response.instrument);
}

export function renderOptionRows(report: OptionReportInstrument[]): string {
  return renderTextTable([
    [
      'uid',
      'positionUid',
      'ticker',
      'classCode',
      'name',
      'currency',
      'lot',
      'exchange',
      'sector',
      'direction',
      'paymentType',
      'style',
      'settlementType',
      'strikePrice',
      'expirationDate',
      'tradingStatus',
      'buyAvailableFlag',
      'sellAvailableFlag',
      'apiTradeAvailableFlag'
    ],
    ...report.map((instrument) => [
      instrument.uid,
      instrument.positionUid,
      instrument.ticker,
      instrument.classCode,
      instrument.name,
      instrument.currency,
      String(instrument.lot),
      instrument.exchange,
      instrument.sector,
      instrument.direction,
      instrument.paymentType,
      instrument.style,
      instrument.settlementType,
      formatReportMoneyText(instrument.strikePrice),
      instrument.expirationDate,
      instrument.tradingStatus,
      String(instrument.buyAvailableFlag),
      String(instrument.sellAvailableFlag),
      String(instrument.apiTradeAvailableFlag)
    ])
  ]);
}

export function formatOptionReport(report: OptionReport, format: OptionFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderOptionRows(report === null ? [] : [report]);
}

export function formatOption(response: OptionResponse, format: OptionFormat): string {
  return formatOptionReport(createOptionReport(response), format);
}
