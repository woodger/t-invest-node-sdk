/**
 * Модуль CLI-репортинга команды `instruments option-by`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  OptionReport,
  OptionReportInstrument
} from '../../../application/reports';
import {
  securityTradingStatusToJSON,
  type MoneyValue,
  type Quotation
} from '../../../generated/common';
import type {
  Option,
  OptionResponse
} from '../../../generated/instruments';
import {
  optionDirectionToJSON,
  optionPaymentTypeToJSON,
  optionSettlementTypeToJSON,
  optionStyleToJSON,
  realExchangeToJSON
} from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const optionFormats = ['json', 'table'] as const;

export type OptionFormat = typeof optionFormats[number];

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
    basicAssetSize: formatDecimal(instrument.basicAssetSize),
    basicAssetPositionUid: instrument.basicAssetPositionUid,
    strikePrice: formatMoney(instrument.strikePrice),
    expirationDate: formatDate(instrument.expirationDate),
    firstTradeDate: formatDate(instrument.firstTradeDate),
    lastTradeDate: formatDate(instrument.lastTradeDate),
    klong: formatDecimal(instrument.klong),
    kshort: formatDecimal(instrument.kshort),
    dlong: formatDecimal(instrument.dlong),
    dshort: formatDecimal(instrument.dshort),
    dlongMin: formatDecimal(instrument.dlongMin),
    dshortMin: formatDecimal(instrument.dshortMin),
    minPriceIncrement: formatDecimal(instrument.minPriceIncrement),
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
      instrument.strikePrice,
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
