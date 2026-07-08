/**
 * Модуль CLI-репортинга команды `instrument bond show`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  BondReport,
  BondReportInstrument
} from '../../../application/reports';
import { securityTradingStatusToJSON } from '../../../generated/common';
import type {
  Bond,
  BondResponse
} from '../../../generated/instruments';
import {
  realExchangeToJSON,
  riskLevelToJSON
} from '../../../generated/instruments';
import {
  formatReportDate,
  formatReportDecimal,
  toReportMoney
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const bondFormats = ['json', 'table'] as const;

export type BondFormat = typeof bondFormats[number];

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
    maturityDate: formatReportDate(instrument.maturityDate),
    nominal: toReportMoney(instrument.nominal),
    initialNominal: toReportMoney(instrument.initialNominal),
    stateRegDate: formatReportDate(instrument.stateRegDate),
    placementDate: formatReportDate(instrument.placementDate),
    placementPrice: toReportMoney(instrument.placementPrice),
    aciValue: toReportMoney(instrument.aciValue),
    issueKind: instrument.issueKind,
    issueSize: instrument.issueSize,
    issueSizePlan: instrument.issueSizePlan,
    klong: formatReportDecimal(instrument.klong),
    kshort: formatReportDecimal(instrument.kshort),
    dlong: formatReportDecimal(instrument.dlong),
    dshort: formatReportDecimal(instrument.dshort),
    dlongMin: formatReportDecimal(instrument.dlongMin),
    dshortMin: formatReportDecimal(instrument.dshortMin),
    minPriceIncrement: formatReportDecimal(instrument.minPriceIncrement),
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
    first1minCandleDate: formatReportDate(instrument.first1minCandleDate),
    first1dayCandleDate: formatReportDate(instrument.first1dayCandleDate)
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
