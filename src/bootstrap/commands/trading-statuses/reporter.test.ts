import assert from 'node:assert';
import { describe, test } from 'node:test';
import { SecurityTradingStatus } from '../../../generated/common';
import type {
  GetTradingStatusResponse,
  GetTradingStatusesResponse
} from '../../../generated/marketdata';
import { createTradingStatusesReport, formatTradingStatusesReport } from './reporter';

function tradingStatus(
  overrides: Partial<GetTradingStatusResponse> = {}
): GetTradingStatusResponse {
  return {
    figi: 'BBG00QPYJ5H0',
    tradingStatus: SecurityTradingStatus.SECURITY_TRADING_STATUS_NORMAL_TRADING,
    limitOrderAvailableFlag: true,
    marketOrderAvailableFlag: false,
    apiTradeAvailableFlag: true,
    instrumentUid: 'instrument-uid',
    ...overrides
  } as GetTradingStatusResponse;
}

function response(
  overrides: Partial<GetTradingStatusesResponse> = {}
): GetTradingStatusesResponse {
  return {
    tradingStatuses: [
      tradingStatus(),
      tradingStatus({
        figi: 'BBG004730N88',
        instrumentUid: 'second-instrument-uid',
        tradingStatus: SecurityTradingStatus.SECURITY_TRADING_STATUS_BREAK_IN_TRADING,
        limitOrderAvailableFlag: false,
        marketOrderAvailableFlag: false,
        apiTradeAvailableFlag: false
      })
    ],
    ...overrides
  } as GetTradingStatusesResponse;
}

describe('trading-statuses reporter', () => {
  describe('createTradingStatusesReport', () => {
    test('maps generated trading statuses to stable report values', () => {
      const report = createTradingStatusesReport(response());

      assert.deepEqual(report, [
        {
          figi: 'BBG00QPYJ5H0',
          instrumentUid: 'instrument-uid',
          tradingStatus: 'SECURITY_TRADING_STATUS_NORMAL_TRADING',
          limitOrderAvailable: true,
          marketOrderAvailable: false,
          apiTradeAvailable: true
        },
        {
          figi: 'BBG004730N88',
          instrumentUid: 'second-instrument-uid',
          tradingStatus: 'SECURITY_TRADING_STATUS_BREAK_IN_TRADING',
          limitOrderAvailable: false,
          marketOrderAvailable: false,
          apiTradeAvailable: false
        }
      ]);
    });
  });

  describe('formatTradingStatusesReport', () => {
    test('formats report as table', () => {
      const output = formatTradingStatusesReport(createTradingStatusesReport(response()), 'table');

      assert.match(
        output,
        /^figi\s+instrumentUid\s+tradingStatus\s+limitOrderAvailable\s+marketOrderAvailable\s+apiTradeAvailable/m
      );
      assert.match(
        output,
        /BBG00QPYJ5H0\s+instrument-uid\s+SECURITY_TRADING_STATUS_NORMAL_TRADING\s+true\s+false\s+true/
      );
      assert.match(
        output,
        /BBG004730N88\s+second-instrument-uid\s+SECURITY_TRADING_STATUS_BREAK_IN_TRADING\s+false\s+false\s+false/
      );
    });

    test('formats report as json', () => {
      const output = formatTradingStatusesReport(createTradingStatusesReport(response()), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].figi, 'BBG00QPYJ5H0');
      assert.equal(parsed[1].instrumentUid, 'second-instrument-uid');
      assert.equal(parsed[1].tradingStatus, 'SECURITY_TRADING_STATUS_BREAK_IN_TRADING');
    });
  });
});
