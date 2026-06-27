/**
 * Модуль CLI-репортинга команды `operations get-broker-report`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  BrokerReportItemReport,
  BrokerReportPageReport,
  BrokerReportReport
} from '../../../application/reports';
import type { MoneyValue, Quotation } from '../../../generated/common';
import type {
  BrokerReport,
  BrokerReportResponse,
  GetBrokerReportResponse
} from '../../../generated/operations';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const brokerReportFormats = ['json', 'table'] as const;

export type BrokerReportFormat = typeof brokerReportFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function formatDecimal(value: MoneyValue | Quotation): string {
  return String(value.units + value.nano / 1e9);
}

function formatMoney(value: MoneyValue | undefined): string {
  if (value === undefined) {
    return '';
  }

  const amount = formatDecimal(value);

  return value.currency === '' ? amount : `${amount} ${value.currency}`;
}

function formatQuotation(value: Quotation | undefined): string {
  return value === undefined ? '' : formatDecimal(value);
}

function toReportItem(item: BrokerReport): BrokerReportItemReport {
  return {
    tradeId: item.tradeId,
    orderId: item.orderId,
    figi: item.figi,
    executeSign: item.executeSign,
    tradeDatetime: formatDate(item.tradeDatetime),
    exchange: item.exchange,
    classCode: item.classCode,
    direction: item.direction,
    name: item.name,
    ticker: item.ticker,
    price: formatMoney(item.price),
    quantity: item.quantity,
    orderAmount: formatMoney(item.orderAmount),
    aciValue: formatQuotation(item.aciValue),
    totalOrderAmount: formatMoney(item.totalOrderAmount),
    brokerCommission: formatMoney(item.brokerCommission),
    exchangeCommission: formatMoney(item.exchangeCommission),
    exchangeClearingCommission: formatMoney(item.exchangeClearingCommission),
    repoRate: formatQuotation(item.repoRate),
    party: item.party,
    clearValueDate: formatDate(item.clearValueDate),
    secValueDate: formatDate(item.secValueDate),
    brokerStatus: item.brokerStatus,
    separateAgreementType: item.separateAgreementType,
    separateAgreementNumber: item.separateAgreementNumber,
    separateAgreementDate: item.separateAgreementDate,
    deliveryType: item.deliveryType
  };
}

function createBrokerReportPage(report: GetBrokerReportResponse): BrokerReportPageReport {
  return {
    type: 'page',
    page: {
      page: report.page,
      pagesCount: report.pagesCount,
      itemsCount: report.itemsCount
    },
    items: report.brokerReport.map(toReportItem)
  };
}

export function createBrokerReportReport(response: BrokerReportResponse): BrokerReportReport {
  if (response.generateBrokerReportResponse !== undefined) {
    return {
      type: 'generate',
      taskId: response.generateBrokerReportResponse.taskId
    };
  }

  if (response.getBrokerReportResponse !== undefined) {
    return createBrokerReportPage(response.getBrokerReportResponse);
  }

  return {
    type: 'empty'
  };
}

function formatBrokerReportPage(report: BrokerReportPageReport): string {
  const table = renderTextTable([
    [
      'tradeId',
      'orderId',
      'tradeDatetime',
      'figi',
      'ticker',
      'direction',
      'price',
      'quantity',
      'orderAmount',
      'totalOrderAmount',
      'brokerCommission'
    ],
    ...report.items.map((item) => [
      item.tradeId,
      item.orderId,
      item.tradeDatetime,
      item.figi,
      item.ticker,
      item.direction,
      item.price,
      String(item.quantity),
      item.orderAmount,
      item.totalOrderAmount,
      item.brokerCommission
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

export function formatBrokerReportReport(
  report: BrokerReportReport,
  format: BrokerReportFormat
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

  return formatBrokerReportPage(report);
}

export function formatBrokerReport(
  response: BrokerReportResponse,
  format: BrokerReportFormat
): string {
  return formatBrokerReportReport(createBrokerReportReport(response), format);
}
