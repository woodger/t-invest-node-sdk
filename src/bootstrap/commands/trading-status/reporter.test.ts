import assert from 'node:assert';
import { describe, test } from 'node:test';
import { SecurityTradingStatus } from '../../../generated/common';
import type { GetTradingStatusResponse } from '../../../generated/marketdata';
import { createTradingStatusReport, formatTradingStatusReport } from './reporter';

function response(
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
  };
}

describe('trading-status reporter', () => {
  describe('createTradingStatusReport', () => {
    test('maps generated trading status fields to stable report values', () => {
      const report = createTradingStatusReport(response());

      assert.deepEqual(report, {
        figi: 'BBG00QPYJ5H0',
        instrumentUid: 'instrument-uid',
        tradingStatus: 'SECURITY_TRADING_STATUS_NORMAL_TRADING',
        limitOrderAvailable: true,
        marketOrderAvailable: false,
        apiTradeAvailable: true
      });
    });
  });

  describe('formatTradingStatusReport', () => {
    test('formats report as table', () => {
      const output = formatTradingStatusReport(createTradingStatusReport(response()), 'table');

      assert.match(
        output,
        /^figi\s+instrumentUid\s+tradingStatus\s+limitOrderAvailable\s+marketOrderAvailable\s+apiTradeAvailable/m
      );
      assert.match(
        output,
        /BBG00QPYJ5H0\s+instrument-uid\s+SECURITY_TRADING_STATUS_NORMAL_TRADING\s+true\s+false\s+true/
      );
    });

    test('formats report as json', () => {
      const output = formatTradingStatusReport(createTradingStatusReport(response()), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed.figi, 'BBG00QPYJ5H0');
      assert.equal(parsed.instrumentUid, 'instrument-uid');
      assert.equal(parsed.tradingStatus, 'SECURITY_TRADING_STATUS_NORMAL_TRADING');
      assert.equal(parsed.limitOrderAvailable, true);
      assert.equal(parsed.marketOrderAvailable, false);
      assert.equal(parsed.apiTradeAvailable, true);
    });
  });
});
