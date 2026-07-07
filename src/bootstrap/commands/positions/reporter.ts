/**
 * Модуль CLI-репортинга команды `operation get-positions`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  PositionsReport,
  PositionsReportFuture,
  PositionsReportOption,
  PositionsReportSecurity
} from '../../../application/reports';
import type {
  PositionsFutures,
  PositionsOptions,
  PositionsResponse,
  PositionsSecurities
} from '../../../generated/operations';
import {
  toReportMoney
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const positionsFormats = ['json', 'table'] as const;

export type PositionsFormat = typeof positionsFormats[number];

function toReportSecurity(position: PositionsSecurities): PositionsReportSecurity {
  return {
    figi: position.figi,
    instrumentUid: position.instrumentUid,
    positionUid: position.positionUid,
    instrumentType: position.instrumentType,
    balance: position.balance,
    blocked: position.blocked,
    exchangeBlocked: position.exchangeBlocked
  };
}

function toReportFuture(position: PositionsFutures): PositionsReportFuture {
  return {
    figi: position.figi,
    instrumentUid: position.instrumentUid,
    positionUid: position.positionUid,
    balance: position.balance,
    blocked: position.blocked
  };
}

function toReportOption(position: PositionsOptions): PositionsReportOption {
  return {
    instrumentUid: position.instrumentUid,
    positionUid: position.positionUid,
    balance: position.balance,
    blocked: position.blocked
  };
}

export function createPositionsReport(response: PositionsResponse): PositionsReport {
  return {
    limitsLoadingInProgress: response.limitsLoadingInProgress,
    money: response.money.map((value) => toReportMoney(value)),
    blocked: response.blocked.map((value) => toReportMoney(value)),
    securities: response.securities.map(toReportSecurity),
    futures: response.futures.map(toReportFuture),
    options: response.options.map(toReportOption)
  };
}

function renderSection(title: string, rows: readonly (readonly string[])[]): string {
  return [
    `${title}:`,
    renderTextTable(rows)
  ].join('\n');
}

export function formatPositionsReport(report: PositionsReport, format: PositionsFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return [
    `limitsLoadingInProgress: ${String(report.limitsLoadingInProgress)}`,
    '',
    renderSection('money', [
      ['currency', 'amount'],
      ...report.money.map((value) => [
        value.currency,
        value.amount
      ])
    ]),
    renderSection('blocked', [
      ['currency', 'amount'],
      ...report.blocked.map((value) => [
        value.currency,
        value.amount
      ])
    ]),
    renderSection('securities', [
      ['figi', 'instrumentUid', 'positionUid', 'instrumentType', 'balance', 'blocked', 'exchangeBlocked'],
      ...report.securities.map((position) => [
        position.figi,
        position.instrumentUid,
        position.positionUid,
        position.instrumentType,
        String(position.balance),
        String(position.blocked),
        String(position.exchangeBlocked)
      ])
    ]),
    renderSection('futures', [
      ['figi', 'instrumentUid', 'positionUid', 'balance', 'blocked'],
      ...report.futures.map((position) => [
        position.figi,
        position.instrumentUid,
        position.positionUid,
        String(position.balance),
        String(position.blocked)
      ])
    ]),
    renderSection('options', [
      ['instrumentUid', 'positionUid', 'balance', 'blocked'],
      ...report.options.map((position) => [
        position.instrumentUid,
        position.positionUid,
        String(position.balance),
        String(position.blocked)
      ])
    ])
  ].join('\n');
}

export function formatPositions(response: PositionsResponse, format: PositionsFormat): string {
  return formatPositionsReport(createPositionsReport(response), format);
}
