/**
 * Модуль CLI-репортинга команды `account get-info`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type { UserInfoReport } from '../../../application/reports';
import type { GetInfoResponse } from '../../../generated/users';
import { renderJson, renderTextTable } from 'icore';

export const userInfoFormats = ['json', 'table'] as const;

export type UserInfoFormat = typeof userInfoFormats[number];

export function createUserInfoReport(response: GetInfoResponse): UserInfoReport {
  return {
    premStatus: response.premStatus,
    qualStatus: response.qualStatus,
    qualifiedForWorkWith: response.qualifiedForWorkWith,
    tariff: response.tariff
  };
}

export function formatUserInfoReport(
  report: UserInfoReport,
  format: UserInfoFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['premStatus', 'qualStatus', 'qualifiedForWorkWith', 'tariff'],
    [
      String(report.premStatus),
      String(report.qualStatus),
      report.qualifiedForWorkWith.join(', '),
      report.tariff
    ]
  ]);
}

export function formatUserInfo(response: GetInfoResponse, format: UserInfoFormat): string {
  return formatUserInfoReport(createUserInfoReport(response), format);
}
