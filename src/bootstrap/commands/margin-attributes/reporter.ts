/**
 * Модуль CLI-репортинга команды `account margin`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { MarginAttributesReport } from '../../../application/reports';
import type { GetMarginAttributesResponse } from '../../../generated/users';
import {
  formatReportDecimal,
  formatReportMoneyText,
  toReportMoney
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const marginAttributesFormats = ['json', 'table'] as const;

export type MarginAttributesFormat = typeof marginAttributesFormats[number];

export function createMarginAttributesReport(
  response: GetMarginAttributesResponse
): MarginAttributesReport {
  return {
    liquidPortfolio: toReportMoney(response.liquidPortfolio),
    startingMargin: toReportMoney(response.startingMargin),
    minimalMargin: toReportMoney(response.minimalMargin),
    fundsSufficiencyLevel: formatReportDecimal(response.fundsSufficiencyLevel),
    amountOfMissingFunds: toReportMoney(response.amountOfMissingFunds),
    correctedMargin: toReportMoney(response.correctedMargin)
  };
}

export function formatMarginAttributesReport(
  report: MarginAttributesReport,
  format: MarginAttributesFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    [
      'liquidPortfolio',
      'startingMargin',
      'minimalMargin',
      'fundsSufficiencyLevel',
      'amountOfMissingFunds',
      'correctedMargin'
    ],
    [
      formatReportMoneyText(report.liquidPortfolio),
      formatReportMoneyText(report.startingMargin),
      formatReportMoneyText(report.minimalMargin),
      report.fundsSufficiencyLevel,
      formatReportMoneyText(report.amountOfMissingFunds),
      formatReportMoneyText(report.correctedMargin)
    ]
  ]);
}

export function formatMarginAttributes(
  response: GetMarginAttributesResponse,
  format: MarginAttributesFormat
): string {
  return formatMarginAttributesReport(createMarginAttributesReport(response), format);
}
