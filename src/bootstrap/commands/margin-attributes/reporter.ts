/**
 * Модуль CLI-репортинга команды `users get-margin-attributes`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор argv и запуск SDK остаются в `cli.ts`.
 */

import type { MarginAttributesReport } from '../../../application/reports';
import type { MoneyValue, Quotation } from '../../../generated/common';
import type { GetMarginAttributesResponse } from '../../../generated/users';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const marginAttributesFormats = ['json', 'table'] as const;

export type MarginAttributesFormat = typeof marginAttributesFormats[number];

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

export function createMarginAttributesReport(
  response: GetMarginAttributesResponse
): MarginAttributesReport {
  return {
    liquidPortfolio: formatMoney(response.liquidPortfolio),
    startingMargin: formatMoney(response.startingMargin),
    minimalMargin: formatMoney(response.minimalMargin),
    fundsSufficiencyLevel: formatDecimal(response.fundsSufficiencyLevel),
    amountOfMissingFunds: formatMoney(response.amountOfMissingFunds),
    correctedMargin: formatMoney(response.correctedMargin)
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
