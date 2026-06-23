/**
 * Модуль CLI-репортинга команды `instruments currency-by`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type {
  CurrencyReport,
  CurrencyReportInstrument
} from '../../../application/reports';
import {
  securityTradingStatusToJSON,
  type MoneyValue,
  type Quotation
} from '../../../generated/common';
import type {
  Currency,
  CurrencyResponse
} from '../../../generated/instruments';
import { realExchangeToJSON } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const currencyFormats = ['json', 'table'] as const;

export type CurrencyFormat = typeof currencyFormats[number];

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

export function createCurrencyReportInstrument(
  instrument: Currency
): CurrencyReportInstrument {
  return {
    figi: instrument.figi,
    ticker: instrument.ticker,
    classCode: instrument.classCode,
    isin: instrument.isin,
    uid: instrument.uid,
    positionUid: instrument.positionUid,
    name: instrument.name,
    currency: instrument.currency,
    isoCurrencyName: instrument.isoCurrencyName,
    lot: instrument.lot,
    exchange: instrument.exchange,
    realExchange: realExchangeToJSON(instrument.realExchange),
    nominal: formatMoney(instrument.nominal),
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
    first1minCandleDate: formatDate(instrument.first1minCandleDate),
    first1dayCandleDate: formatDate(instrument.first1dayCandleDate)
  };
}

export function createCurrencyReport(response: CurrencyResponse): CurrencyReport {
  return response.instrument === undefined
    ? null
    : createCurrencyReportInstrument(response.instrument);
}

export function renderCurrencyRows(report: CurrencyReportInstrument[]): string {
  return renderTextTable([
    [
      'figi',
      'ticker',
      'classCode',
      'uid',
      'positionUid',
      'name',
      'currency',
      'isoCurrencyName',
      'lot',
      'exchange',
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
      instrument.isoCurrencyName,
      String(instrument.lot),
      instrument.exchange,
      instrument.tradingStatus,
      String(instrument.buyAvailableFlag),
      String(instrument.sellAvailableFlag),
      String(instrument.apiTradeAvailableFlag)
    ])
  ]);
}

export function formatCurrencyReport(
  report: CurrencyReport,
  format: CurrencyFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderCurrencyRows(report === null ? [] : [report]);
}

export function formatCurrency(response: CurrencyResponse, format: CurrencyFormat): string {
  return formatCurrencyReport(createCurrencyReport(response), format);
}
