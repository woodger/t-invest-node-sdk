import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import type { TradingDay,
  TradingSchedule
} from '../../../generated/instruments';
import { createTradingSchedulesReport, formatTradingSchedulesReport } from './reporter';

function tradingDay(overrides: Partial<TradingDay> = {}): TradingDay {
  return {
    date: new Date('2026-01-02T00:00:00Z'),
    isTradingDay: true,
    startTime: new Date('2026-01-02T07:00:00Z'),
    endTime: new Date('2026-01-02T16:00:00Z'),
    openingAuctionStartTime: new Date('2026-01-02T06:50:00Z'),
    closingAuctionEndTime: new Date('2026-01-02T16:10:00Z'),
    eveningOpeningAuctionStartTime: new Date('2026-01-02T16:50:00Z'),
    eveningStartTime: new Date('2026-01-02T17:00:00Z'),
    eveningEndTime: new Date('2026-01-02T20:00:00Z'),
    clearingStartTime: new Date('2026-01-02T14:00:00Z'),
    clearingEndTime: new Date('2026-01-02T14:30:00Z'),
    premarketStartTime: new Date('2026-01-02T06:00:00Z'),
    premarketEndTime: new Date('2026-01-02T06:45:00Z'),
    closingAuctionStartTime: new Date('2026-01-02T16:00:00Z'),
    openingAuctionEndTime: new Date('2026-01-02T06:59:00Z'),
    ...overrides
  } as TradingDay;
}

function schedule(overrides: Partial<TradingSchedule> = {}): TradingSchedule {
  return {
    exchange: 'MOEX',
    days: [tradingDay()],
    ...overrides
  } as TradingSchedule;
}

describe('trading-schedules reporter', () => {
  describe('createTradingSchedulesReport', () => {
    test('flattens generated schedules to stable report values', () => {
      const report = createTradingSchedulesReport([schedule()]);

      assert.deepEqual(report, [
        {
          exchange: 'MOEX',
          date: '2026-01-02T00:00:00.000Z',
          isTradingDay: true,
          startTime: '2026-01-02T07:00:00.000Z',
          endTime: '2026-01-02T16:00:00.000Z',
          openingAuctionStartTime: '2026-01-02T06:50:00.000Z',
          openingAuctionEndTime: '2026-01-02T06:59:00.000Z',
          closingAuctionStartTime: '2026-01-02T16:00:00.000Z',
          closingAuctionEndTime: '2026-01-02T16:10:00.000Z',
          eveningOpeningAuctionStartTime: '2026-01-02T16:50:00.000Z',
          eveningStartTime: '2026-01-02T17:00:00.000Z',
          eveningEndTime: '2026-01-02T20:00:00.000Z',
          clearingStartTime: '2026-01-02T14:00:00.000Z',
          clearingEndTime: '2026-01-02T14:30:00.000Z',
          premarketStartTime: '2026-01-02T06:00:00.000Z',
          premarketEndTime: '2026-01-02T06:45:00.000Z'
        }
      ]);
    });

    test('maps missing dates to empty strings', () => {
      const report = createTradingSchedulesReport([
        schedule({
          days: [
            tradingDay({
              date: undefined,
              startTime: undefined,
              endTime: undefined,
              eveningStartTime: undefined,
              eveningEndTime: undefined
            })
          ]
        })
      ]);

      assert.equal(report.at(0)?.date, '');
      assert.equal(report.at(0)?.startTime, '');
      assert.equal(report.at(0)?.endTime, '');
      assert.equal(report.at(0)?.eveningStartTime, '');
      assert.equal(report.at(0)?.eveningEndTime, '');
    });
  });

  describe('formatTradingSchedulesReport', () => {
    test('formats report as table', () => {
      const output = formatTradingSchedulesReport(createTradingSchedulesReport([schedule()]), 'table');

      assert.match(output, /^exchange\s+date\s+isTradingDay\s+startTime\s+endTime/m);
      assert.match(output, /MOEX\s+2026-01-02T00:00:00\.000Z\s+true/);
      assert.match(output, /2026-01-02T17:00:00\.000Z\s+2026-01-02T20:00:00\.000Z/);
    });

    test('formats report as json', () => {
      const output = formatTradingSchedulesReport(createTradingSchedulesReport([schedule()]), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].exchange, 'MOEX');
      assert.equal(parsed[0].openingAuctionStartTime, '2026-01-02T06:50:00.000Z');
      assert.equal(parsed[0].premarketEndTime, '2026-01-02T06:45:00.000Z');
    });
  });
});
