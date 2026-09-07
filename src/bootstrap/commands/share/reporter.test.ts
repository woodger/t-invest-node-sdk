import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import type { MoneyValue,
  Quotation } from '../../../generated/common';
import { RealExchange, SecurityTradingStatus } from '../../../generated/common';
import {
  ShareType,
  type Share,
  type ShareResponse
} from '../../../generated/instruments';
import { createShareReport, formatShareReport } from './reporter';

function quotation(units: number, nano: number): Quotation {
  return { units, nano };
}

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return { units, nano, currency };
}

function share(overrides: Partial<Share> = {}): Share {
  return {
    figi: 'BBG004730N88',
    ticker: 'SBER',
    classCode: 'TQBR',
    isin: 'RU0009029540',
    lot: 10,
    currency: 'rub',
    dlong: quotation(0, 100000000),
    dshort: quotation(0, 200000000),
    dlongMin: quotation(0, 300000000),
    dshortMin: quotation(0, 400000000),
    shortEnabledFlag: true,
    name: 'Sber',
    exchange: 'MOEX',
    ipoDate: new Date('2007-07-20T00:00:00.000Z'),
    issueSize: 21586948000,
    countryOfRisk: 'RU',
    countryOfRiskName: 'Russia',
    sector: 'Financials',
    issueSizePlan: 21586948000,
    nominal: money(3, 0, 'rub'),
    tradingStatus: SecurityTradingStatus.SECURITY_TRADING_STATUS_NORMAL_TRADING,
    otcFlag: false,
    buyAvailableFlag: true,
    sellAvailableFlag: true,
    divYieldFlag: true,
    shareType: ShareType.SHARE_TYPE_COMMON,
    minPriceIncrement: quotation(0, 10000000),
    apiTradeAvailableFlag: true,
    uid: 'share-uid',
    realExchange: RealExchange.REAL_EXCHANGE_MOEX,
    positionUid: 'position-uid',
    forIisFlag: true,
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    liquidityFlag: true,
    first1minCandleDate: new Date('2026-06-19T10:00:00.000Z'),
    first1dayCandleDate: new Date('2026-06-20T00:00:00.000Z'),
    ...overrides
  } as Share;
}

function response(overrides: Partial<ShareResponse> = {}): ShareResponse {
  return {
    instrument: share(),
    ...overrides
  } as ShareResponse;
}

describe('share reporter', () => {
  describe('createShareReport', () => {
    test('maps generated share fields to stable report values', () => {
      const report = createShareReport(response());

      assert.deepEqual(report, {
        figi: 'BBG004730N88',
        ticker: 'SBER',
        classCode: 'TQBR',
        isin: 'RU0009029540',
        uid: 'share-uid',
        positionUid: 'position-uid',
        name: 'Sber',
        currency: 'rub',
        lot: 10,
        exchange: 'MOEX',
        realExchange: 'REAL_EXCHANGE_MOEX',
        sector: 'Financials',
        nominal: {
          currency: 'rub',
          amount: '3'
        },
        ipoDate: '2007-07-20T00:00:00.000Z',
        issueSize: 21586948000,
        issueSizePlan: 21586948000,
        shareType: 'SHARE_TYPE_COMMON',
        dlong: '0.1',
        dshort: '0.2',
        dlongMin: '0.3',
        dshortMin: '0.4',
        minPriceIncrement: '0.01',
        tradingStatus: 'SECURITY_TRADING_STATUS_NORMAL_TRADING',
        countryOfRisk: 'RU',
        countryOfRiskName: 'Russia',
        otcFlag: false,
        buyAvailableFlag: true,
        sellAvailableFlag: true,
        divYieldFlag: true,
        apiTradeAvailableFlag: true,
        shortEnabledFlag: true,
        forIisFlag: true,
        forQualInvestorFlag: false,
        weekendFlag: false,
        blockedTcaFlag: false,
        liquidityFlag: true,
        first1minCandleDate: '2026-06-19T10:00:00.000Z',
        first1dayCandleDate: '2026-06-20T00:00:00.000Z'
      });
    });

    test('returns null when response has no instrument', () => {
      assert.equal(createShareReport(response({ instrument: undefined })), null);
    });
  });

  describe('formatShareReport', () => {
    test('formats report as table', () => {
      const output = formatShareReport(createShareReport(response()), 'table');

      assert.match(output, /^figi\s+ticker\s+classCode\s+uid\s+positionUid\s+name/m);
      assert.match(output, /BBG004730N88\s+SBER\s+TQBR\s+share-uid/);
      assert.match(output, /Sber\s+rub\s+10\s+MOEX\s+Financials\s+SHARE_TYPE_COMMON/);
      assert.doesNotMatch(output, /2007-07-20/);
    });

    test('formats report as json', () => {
      const report = createShareReport(response());
      const output = formatShareReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });

    test('formats missing share as json null and table header', () => {
      assert.equal(formatShareReport(null, 'json'), 'null\n');
      assert.match(formatShareReport(null, 'table'), /^figi\s+ticker\s+classCode/);
    });
  });
});
