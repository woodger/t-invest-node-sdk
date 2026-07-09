/**
 * Модуль CLI-репортинга команды `instrument schedules`.
 *
 * Здесь допустимы mapping generated DTO в application report contract и
 * presentation formatting. Разбор command options и запуск SDK остаются в `cli.ts`.
 */

import type {
  TradingSchedulesReport,
  TradingSchedulesReportDay
} from '../../../application/reports';
import type { TradingDay, TradingSchedule } from '../../../generated/t_tech/invest/grpc/instruments';
import {
  formatReportDate
} from '../../../infrastructure/report-values';
import { renderJson, renderTextTable } from 'icore';

export const tradingSchedulesFormats = ['json', 'table'] as const;

export type TradingSchedulesFormat = typeof tradingSchedulesFormats[number];

function toReportDay(exchange: string, day: TradingDay): TradingSchedulesReportDay {
  return {
    exchange,
    date: formatReportDate(day.date),
    isTradingDay: day.isTradingDay,
    startTime: formatReportDate(day.startTime),
    endTime: formatReportDate(day.endTime),
    openingAuctionStartTime: formatReportDate(day.openingAuctionStartTime),
    openingAuctionEndTime: formatReportDate(day.openingAuctionEndTime),
    closingAuctionStartTime: formatReportDate(day.closingAuctionStartTime),
    closingAuctionEndTime: formatReportDate(day.closingAuctionEndTime),
    eveningOpeningAuctionStartTime: formatReportDate(day.eveningOpeningAuctionStartTime),
    eveningStartTime: formatReportDate(day.eveningStartTime),
    eveningEndTime: formatReportDate(day.eveningEndTime),
    clearingStartTime: formatReportDate(day.clearingStartTime),
    clearingEndTime: formatReportDate(day.clearingEndTime),
    premarketStartTime: formatReportDate(day.premarketStartTime),
    premarketEndTime: formatReportDate(day.premarketEndTime)
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
