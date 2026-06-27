/**
 * Модуль CLI-репортинга команды `instruments trading-schedules`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  TradingSchedulesReport,
  TradingSchedulesReportDay
} from '../../../application/reports';
import type { TradingDay, TradingSchedule } from '../../../generated/instruments';
import { renderJson } from '../../../infrastructure/renderers/json-renderer';
import { renderTextTable } from '../../../infrastructure/renderers/table-renderer';

export const tradingSchedulesFormats = ['json', 'table'] as const;

export type TradingSchedulesFormat = typeof tradingSchedulesFormats[number];

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function toReportDay(exchange: string, day: TradingDay): TradingSchedulesReportDay {
  return {
    exchange,
    date: formatDate(day.date),
    isTradingDay: day.isTradingDay,
    startTime: formatDate(day.startTime),
    endTime: formatDate(day.endTime),
    openingAuctionStartTime: formatDate(day.openingAuctionStartTime),
    openingAuctionEndTime: formatDate(day.openingAuctionEndTime),
    closingAuctionStartTime: formatDate(day.closingAuctionStartTime),
    closingAuctionEndTime: formatDate(day.closingAuctionEndTime),
    eveningOpeningAuctionStartTime: formatDate(day.eveningOpeningAuctionStartTime),
    eveningStartTime: formatDate(day.eveningStartTime),
    eveningEndTime: formatDate(day.eveningEndTime),
    clearingStartTime: formatDate(day.clearingStartTime),
    clearingEndTime: formatDate(day.clearingEndTime),
    premarketStartTime: formatDate(day.premarketStartTime),
    premarketEndTime: formatDate(day.premarketEndTime)
  };
}

export function createTradingSchedulesReport(
  schedules: TradingSchedule[]
): TradingSchedulesReport {
  return schedules.flatMap((schedule) => (
    schedule.days.map((day) => toReportDay(schedule.exchange, day))
  ));
}

export function formatTradingSchedulesReport(
  report: TradingSchedulesReport,
  format: TradingSchedulesFormat
): string {
  if (format === 'json') {
    return renderJson(report);
  }

  return renderTextTable([
    ['exchange', 'date', 'isTradingDay', 'startTime', 'endTime', 'eveningStartTime', 'eveningEndTime'],
    ...report.map((day) => [
      day.exchange,
      day.date,
      String(day.isTradingDay),
      day.startTime,
      day.endTime,
      day.eveningStartTime,
      day.eveningEndTime
    ])
  ]);
}

export function formatTradingSchedules(
  schedules: TradingSchedule[],
  format: TradingSchedulesFormat
): string {
  return formatTradingSchedulesReport(createTradingSchedulesReport(schedules), format);
}
