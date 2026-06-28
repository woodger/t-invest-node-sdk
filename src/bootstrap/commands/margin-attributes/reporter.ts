/**
 * Модуль CLI-репортинга команды `users get-margin-attributes`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { MarginAttributesReport } from '../../../application/reports';
import type { GetMarginAttributesResponse } from '../../../generated/users';
import {
  formatReportDecimal,
  formatReportMoney
} from '../../../infrastructure/report-values';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const marginAttributesFormats = ['json', 'table'] as const;

export type MarginAttributesFormat = typeof marginAttributesFormats[number];

export function createMarginAttributesReport(
  response: GetMarginAttributesResponse
): MarginAttributesReport {
  return {
    liquidPortfolio: formatReportMoney(response.liquidPortfolio),
    startingMargin: formatReportMoney(response.startingMargin),
    minimalMargin: formatReportMoney(response.minimalMargin),
    fundsSufficiencyLevel: formatReportDecimal(response.fundsSufficiencyLevel),
    amountOfMissingFunds: formatReportMoney(response.amountOfMissingFunds),
    correctedMargin: formatReportMoney(response.correctedMargin)
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
      report.liquidPortfolio,
      report.startingMargin,
      report.minimalMargin,
      report.fundsSufficiencyLevel,
      report.amountOfMissingFunds,
      report.correctedMargin
    ]
  ]);
}

export function formatMarginAttributes(
  response: GetMarginAttributesResponse,
  format: MarginAttributesFormat
): string {
  return formatMarginAttributesReport(createMarginAttributesReport(response), format);
}
