/**
 * Модуль CLI-репортинга команды `operations get-dividends-foreign-issuer`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  DividendsForeignIssuerItemReport,
  DividendsForeignIssuerPageReport,
  DividendsForeignIssuerReport
} from '../../../application/reports';
import type {
  DividendsForeignIssuerReport as GeneratedDividendsForeignIssuerReport,
  GetDividendsForeignIssuerReportResponse,
  GetDividendsForeignIssuerResponse
} from '../../../generated/operations';
import {
  formatReportDate,
  formatReportQuotation
} from '../../../infrastructure/report-values';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const dividendsForeignIssuerFormats = ['json', 'table'] as const;

export type DividendsForeignIssuerFormat = typeof dividendsForeignIssuerFormats[number];

function toReportItem(
  item: GeneratedDividendsForeignIssuerReport
): DividendsForeignIssuerItemReport {
  return {
    recordDate: formatReportDate(item.recordDate),
    paymentDate: formatReportDate(item.paymentDate),
    securityName: item.securityName,
    isin: item.isin,
    issuerCountry: item.issuerCountry,
    quantity: item.quantity,
    dividend: formatReportQuotation(item.dividend),
    externalCommission: formatReportQuotation(item.externalCommission),
    dividendGross: formatReportQuotation(item.dividendGross),
    tax: formatReportQuotation(item.tax),
    dividendAmount: formatReportQuotation(item.dividendAmount),
    currency: item.currency
  };
}

function createDividendsForeignIssuerPage(
  report: GetDividendsForeignIssuerReportResponse
): DividendsForeignIssuerPageReport {
  return {
    type: 'page',
    page: {
      page: report.page,
      pagesCount: report.pagesCount,
      itemsCount: report.itemsCount
    },
    items: report.dividendsForeignIssuerReport.map(toReportItem)
  };
}

export function createDividendsForeignIssuerReport(
  response: GetDividendsForeignIssuerResponse
): DividendsForeignIssuerReport {
  if (response.generateDivForeignIssuerReportResponse !== undefined) {
    return {
      type: 'generate',
      taskId: response.generateDivForeignIssuerReportResponse.taskId
    };
  }

  if (response.divForeignIssuerReport !== undefined) {
    return createDividendsForeignIssuerPage(response.divForeignIssuerReport);
  }

  return {
    type: 'empty'
  };
}

function formatDividendsForeignIssuerPage(
  report: DividendsForeignIssuerPageReport
): string {
  const table = renderTextTable([
    [
      'recordDate',
      'paymentDate',
      'securityName',
      'isin',
      'issuerCountry',
      'quantity',
      'dividend',
      'dividendGross',
      'tax',
      'dividendAmount',
      'currency'
    ],
    ...report.items.map((item) => [
      item.recordDate,
      item.paymentDate,
      item.securityName,
      item.isin,
      item.issuerCountry,
      String(item.quantity),
      item.dividend,
      item.dividendGross,
      item.tax,
      item.dividendAmount,
      item.currency
    ])
  ]);

  return [
    `page: ${String(report.page.page)}`,
    `pagesCount: ${String(report.page.pagesCount)}`,
    `itemsCount: ${String(report.page.itemsCount)}`,
    '',
    table
  ].join('\n');
}

export function formatDividendsForeignIssuerReport(
  report: DividendsForeignIssuerReport,
  format: DividendsForeignIssuerFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  if (report.type === 'generate') {
    return `type: generate\ntaskId: ${report.taskId}\n`;
  }

  if (report.type === 'empty') {
    return 'type: empty\n';
  }

  return formatDividendsForeignIssuerPage(report);
}

export function formatDividendsForeignIssuer(
  response: GetDividendsForeignIssuerResponse,
  format: DividendsForeignIssuerFormat
): string {
  return formatDividendsForeignIssuerReport(
    createDividendsForeignIssuerReport(response),
    format
  );
}
