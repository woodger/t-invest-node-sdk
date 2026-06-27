/**
 * Модуль CLI-репортинга команды `operations get-portfolio`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  PortfolioReport,
  PortfolioReportPosition,
  PortfolioReportSummary
} from '../../../application/reports';
import type { MoneyValue, Quotation } from '../../../generated/common';
import type { PortfolioPosition, PortfolioResponse } from '../../../generated/operations';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const portfolioFormats = ['json', 'table'] as const;

export type PortfolioFormat = typeof portfolioFormats[number];

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

function toSummary(response: PortfolioResponse): PortfolioReportSummary {
  return {
    accountId: response.accountId,
    totalAmountPortfolio: formatMoney(response.totalAmountPortfolio),
    totalAmountShares: formatMoney(response.totalAmountShares),
    totalAmountBonds: formatMoney(response.totalAmountBonds),
    totalAmountEtf: formatMoney(response.totalAmountEtf),
    totalAmountCurrencies: formatMoney(response.totalAmountCurrencies),
    totalAmountFutures: formatMoney(response.totalAmountFutures),
    totalAmountOptions: formatMoney(response.totalAmountOptions),
    totalAmountSp: formatMoney(response.totalAmountSp),
    expectedYield: formatDecimal(response.expectedYield)
  };
}

function toReportPosition(position: PortfolioPosition): PortfolioReportPosition {
  return {
    figi: position.figi,
    instrumentUid: position.instrumentUid,
    positionUid: position.positionUid,
    instrumentType: position.instrumentType,
    quantity: formatDecimal(position.quantity),
    averagePositionPrice: formatMoney(position.averagePositionPrice),
    currentPrice: formatMoney(position.currentPrice),
    expectedYield: formatDecimal(position.expectedYield),
    blocked: position.blocked
  };
}

export function createPortfolioReport(response: PortfolioResponse): PortfolioReport {
  return {
    summary: toSummary(response),
    positions: response.positions.map(toReportPosition)
  };
}

function renderPortfolioSummary(summary: PortfolioReportSummary): string {
  return [
    `accountId: ${summary.accountId}`,
    `totalAmountPortfolio: ${summary.totalAmountPortfolio}`,
    `totalAmountShares: ${summary.totalAmountShares}`,
    `totalAmountBonds: ${summary.totalAmountBonds}`,
    `totalAmountEtf: ${summary.totalAmountEtf}`,
    `totalAmountCurrencies: ${summary.totalAmountCurrencies}`,
    `totalAmountFutures: ${summary.totalAmountFutures}`,
    `totalAmountOptions: ${summary.totalAmountOptions}`,
    `totalAmountSp: ${summary.totalAmountSp}`,
    `expectedYield: ${summary.expectedYield}`
  ].join('\n');
}

export function formatPortfolioReport(report: PortfolioReport, format: PortfolioFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  const positionsTable = renderTextTable([
    [
      'figi',
      'instrumentUid',
      'positionUid',
      'instrumentType',
      'quantity',
      'averagePositionPrice',
      'currentPrice',
      'expectedYield',
      'blocked'
    ],
    ...report.positions.map((position) => [
      position.figi,
      position.instrumentUid,
      position.positionUid,
      position.instrumentType,
      position.quantity,
      position.averagePositionPrice,
      position.currentPrice,
      position.expectedYield,
      String(position.blocked)
    ])
  ]);

  return `${renderPortfolioSummary(report.summary)}\n\n${positionsTable}`;
}

export function formatPortfolio(response: PortfolioResponse, format: PortfolioFormat): string {
  return formatPortfolioReport(createPortfolioReport(response), format);
}
