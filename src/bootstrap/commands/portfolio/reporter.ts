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
import type { PortfolioPosition, PortfolioResponse } from '../../../generated/operations';
import {
  formatReportDecimal,
  formatReportMoneyText,
  toReportMoney
} from '../../../infrastructure/report-values';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const portfolioFormats = ['json', 'table'] as const;

export type PortfolioFormat = typeof portfolioFormats[number];

function toSummary(response: PortfolioResponse): PortfolioReportSummary {
  return {
    accountId: response.accountId,
    totalAmountPortfolio: toReportMoney(response.totalAmountPortfolio),
    totalAmountShares: toReportMoney(response.totalAmountShares),
    totalAmountBonds: toReportMoney(response.totalAmountBonds),
    totalAmountEtf: toReportMoney(response.totalAmountEtf),
    totalAmountCurrencies: toReportMoney(response.totalAmountCurrencies),
    totalAmountFutures: toReportMoney(response.totalAmountFutures),
    totalAmountOptions: toReportMoney(response.totalAmountOptions),
    totalAmountSp: toReportMoney(response.totalAmountSp),
    expectedYield: formatReportDecimal(response.expectedYield)
  };
}

function toReportPosition(position: PortfolioPosition): PortfolioReportPosition {
  return {
    figi: position.figi,
    instrumentUid: position.instrumentUid,
    positionUid: position.positionUid,
    instrumentType: position.instrumentType,
    quantity: formatReportDecimal(position.quantity),
    averagePositionPrice: toReportMoney(position.averagePositionPrice),
    currentPrice: toReportMoney(position.currentPrice),
    expectedYield: formatReportDecimal(position.expectedYield),
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
    `totalAmountPortfolio: ${formatReportMoneyText(summary.totalAmountPortfolio)}`,
    `totalAmountShares: ${formatReportMoneyText(summary.totalAmountShares)}`,
    `totalAmountBonds: ${formatReportMoneyText(summary.totalAmountBonds)}`,
    `totalAmountEtf: ${formatReportMoneyText(summary.totalAmountEtf)}`,
    `totalAmountCurrencies: ${formatReportMoneyText(summary.totalAmountCurrencies)}`,
    `totalAmountFutures: ${formatReportMoneyText(summary.totalAmountFutures)}`,
    `totalAmountOptions: ${formatReportMoneyText(summary.totalAmountOptions)}`,
    `totalAmountSp: ${formatReportMoneyText(summary.totalAmountSp)}`,
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
      formatReportMoneyText(position.averagePositionPrice),
      formatReportMoneyText(position.currentPrice),
      position.expectedYield,
      String(position.blocked)
    ])
  ]);

  return `${renderPortfolioSummary(report.summary)}\n\n${positionsTable}`;
}

export function formatPortfolio(response: PortfolioResponse, format: PortfolioFormat): string {
  return formatPortfolioReport(createPortfolioReport(response), format);
}
