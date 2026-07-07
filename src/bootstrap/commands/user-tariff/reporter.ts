/**
 * Модуль CLI-репортинга команды `account get-user-tariff`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { UserTariffReport } from '../../../application/reports';
import type { GetUserTariffResponse } from '../../../generated/users';
import { renderJson, renderTextTable } from 'icore';

export const userTariffFormats = ['json', 'table'] as const;

export type UserTariffFormat = typeof userTariffFormats[number];

export function createUserTariffReport(response: GetUserTariffResponse): UserTariffReport {
  return {
    unaryLimits: response.unaryLimits.map((limit) => ({
      limitPerMinute: limit.limitPerMinute,
      methods: limit.methods
    })),
    streamLimits: response.streamLimits.map((limit) => ({
      limit: limit.limit,
      streams: limit.streams,
      open: limit.open
    }))
  };
}

export function formatUserTariffReport(
  report: UserTariffReport,
  format: UserTariffFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['type', 'limit', 'open', 'methods/streams'],
    ...report.unaryLimits.map((limit) => [
      'unary',
      String(limit.limitPerMinute),
      '',
      limit.methods.join(', ')
    ]),
    ...report.streamLimits.map((limit) => [
      'stream',
      String(limit.limit),
      String(limit.open),
      limit.streams.join(', ')
    ])
  ]);
}

export function formatUserTariff(
  response: GetUserTariffResponse,
  format: UserTariffFormat
): string {
  return formatUserTariffReport(createUserTariffReport(response), format);
}
