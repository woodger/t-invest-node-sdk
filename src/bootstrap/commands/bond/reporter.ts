/**
 * Модуль CLI-репортинга команды `instruments bond-by`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  BondReport,
  BondReportInstrument
} from '../../../application/reports';
import {
  securityTradingStatusToJSON,
  type MoneyValue,
  type Quotation
} from '../../../generated/common';
import type {
  Bond,
  BondResponse
} from '../../../generated/instruments';
import {
  realExchangeToJSON,
  riskLevelToJSON
} from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const bondFormats = ['json', 'table'] as const;

export type BondFormat = typeof bondFormats[number];

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

export function createBondReportInstrument(instrument: Bond): BondReportInstrument {
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
    couponQuantityPerYear: instrument.couponQuantityPerYear,
    maturityDate: formatDate(instrument.maturityDate),
    nominal: formatMoney(instrument.nominal),
    initialNominal: formatMoney(instrument.initialNominal),
    stateRegDate: formatDate(instrument.stateRegDate),
    placementDate: formatDate(instrument.placementDate),
    placementPrice: formatMoney(instrument.placementPrice),
    aciValue: formatMoney(instrument.aciValue),
    issueKind: instrument.issueKind,
    issueSize: instrument.issueSize,
    issueSizePlan: instrument.issueSizePlan,
    klong: formatDecimal(instrument.klong),
    kshort: formatDecimal(instrument.kshort),
    dlong: formatDecimal(instrument.dlong),
    dshort: formatDecimal(instrument.dshort),
    dlongMin: formatDecimal(instrument.dlongMin),
    dshortMin: formatDecimal(instrument.dshortMin),
    minPriceIncrement: formatDecimal(instrument.minPriceIncrement),
    tradingStatus: securityTradingStatusToJSON(instrument.tradingStatus),
    riskLevel: riskLevelToJSON(instrument.riskLevel),
    countryOfRisk: instrument.countryOfRisk,
    countryOfRiskName: instrument.countryOfRiskName,
    otcFlag: instrument.otcFlag,
    buyAvailableFlag: instrument.buyAvailableFlag,
    sellAvailableFlag: instrument.sellAvailableFlag,
    floatingCouponFlag: instrument.floatingCouponFlag,
    perpetualFlag: instrument.perpetualFlag,
    amortizationFlag: instrument.amortizationFlag,
    apiTradeAvailableFlag: instrument.apiTradeAvailableFlag,
    shortEnabledFlag: instrument.shortEnabledFlag,
    forIisFlag: instrument.forIisFlag,
    forQualInvestorFlag: instrument.forQualInvestorFlag,
    weekendFlag: instrument.weekendFlag,
    blockedTcaFlag: instrument.blockedTcaFlag,
    subordinatedFlag: instrument.subordinatedFlag,
    liquidityFlag: instrument.liquidityFlag,
    first1minCandleDate: formatDate(instrument.first1minCandleDate),
    first1dayCandleDate: formatDate(instrument.first1dayCandleDate)
  };
}

export function createBondReport(response: BondResponse): BondReport {
  return response.instrument === undefined ? null : createBondReportInstrument(response.instrument);
}

export function renderBondRows(report: BondReportInstrument[]): string {
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
      'maturityDate',
      'couponQuantityPerYear',
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
      instrument.maturityDate,
      String(instrument.couponQuantityPerYear),
      instrument.tradingStatus,
      String(instrument.buyAvailableFlag),
      String(instrument.sellAvailableFlag),
      String(instrument.apiTradeAvailableFlag)
    ])
  ]);
}

export function formatBondReport(report: BondReport, format: BondFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderBondRows(report === null ? [] : [report]);
}

export function formatBond(response: BondResponse, format: BondFormat): string {
  return formatBondReport(createBondReport(response), format);
}
