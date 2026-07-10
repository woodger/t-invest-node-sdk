/**
 * Модуль CLI-репортинга команды `operation broker-report`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  BrokerReportItemReport,
  BrokerReportPageReport,
  BrokerReportReport
} from '../../../application/reports';
import type {
  BrokerReport,
  BrokerReportResponse,
  GetBrokerReportResponse
} from '../../../generated/t_tech/invest/grpc/operations';
import {
  formatReportDate,
  formatReportMoneyText,
  formatReportQuotation,
  toReportMoney
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const brokerReportFormats = ['json', 'table'] as const;

export type BrokerReportFormat = typeof brokerReportFormats[number];

function toReportItem(item: BrokerReport): BrokerReportItemReport {
  return {
    tradeId: item.tradeId,
    orderId: item.orderId,
    figi: item.figi,
    executeSign: item.executeSign,
    tradeDatetime: formatReportDate(item.tradeDatetime),
    exchange: item.exchange,
    classCode: item.classCode,
    direction: item.direction,
    name: item.name,
    ticker: item.ticker,
    price: toReportMoney(item.price),
    quantity: item.quantity,
    orderAmount: toReportMoney(item.orderAmount),
    aciValue: formatReportQuotation(item.aciValue),
    totalOrderAmount: toReportMoney(item.totalOrderAmount),
    brokerCommission: toReportMoney(item.brokerCommission),
    exchangeCommission: toReportMoney(item.exchangeCommission),
    exchangeClearingCommission: toReportMoney(item.exchangeClearingCommission),
    repoRate: formatReportQuotation(item.repoRate),
    party: item.party,
    clearValueDate: formatReportDate(item.clearValueDate),
    secValueDate: formatReportDate(item.secValueDate),
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
      formatReportMoneyText(item.price),
      String(item.quantity),
      formatReportMoneyText(item.orderAmount),
      formatReportMoneyText(item.totalOrderAmount),
      formatReportMoneyText(item.brokerCommission)
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
