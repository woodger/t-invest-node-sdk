import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import {
  RealExchange,
  SecurityTradingStatus,
  type Quotation
} from '../../../generated/t_tech/invest/grpc/common';
import { type Future, type FutureResponse } from '../../../generated/t_tech/invest/grpc/instruments';
import { createFutureReport, formatFutureReport } from './reporter';

function quotation(units: number, nano: number): Quotation {
  return { units, nano };
}

function future(overrides: Partial<Future> = {}): Future {
  return {
    figi: 'FUTFIGI',
    ticker: 'SiM6',
    classCode: 'SPBFUT',
    lot: 1,
    currency: 'rub',
    klong: quotation(2, 0),
    kshort: quotation(1, 500000000),
    dlong: quotation(0, 100000000),
    dshort: quotation(0, 200000000),
    dlongMin: quotation(0, 300000000),
    dshortMin: quotation(0, 400000000),
    shortEnabledFlag: true,
    name: 'USD/RUB Futures',
    exchange: 'MOEX',
    firstTradeDate: new Date('2026-03-01T00:00:00.000Z'),
    lastTradeDate: new Date('2026-06-18T00:00:00.000Z'),
    futuresType: 'cash_settlement',
    assetType: 'currency',
    basicAsset: 'USD/RUB',
    basicAssetSize: quotation(1000, 0),
    countryOfRisk: 'RU',
    countryOfRiskName: 'Russia',
    sector: 'Currencies',
    expirationDate: new Date('2026-06-19T00:00:00.000Z'),
    tradingStatus: SecurityTradingStatus.SECURITY_TRADING_STATUS_NORMAL_TRADING,
    otcFlag: false,
    buyAvailableFlag: true,
    sellAvailableFlag: true,
    minPriceIncrement: quotation(0, 1000000),
    apiTradeAvailableFlag: true,
    uid: 'future-uid',
    realExchange: RealExchange.REAL_EXCHANGE_MOEX,
    positionUid: 'position-uid',
    basicAssetPositionUid: 'basic-position-uid',
    forIisFlag: true,
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    first1minCandleDate: new Date('2026-06-19T10:00:00.000Z'),
    first1dayCandleDate: new Date('2026-06-20T00:00:00.000Z'),
    ...overrides
  } as Future;
}

function response(overrides: Partial<FutureResponse> = {}): FutureResponse {
  return {
    instrument: future(),
    ...overrides
  } as FutureResponse;
}

describe('future reporter', () => {
  describe('createFutureReport', () => {
    test('maps generated future fields to stable report values', () => {
      const report = createFutureReport(response());

      assert.deepEqual(report, {
        figi: 'FUTFIGI',
        ticker: 'SiM6',
        classCode: 'SPBFUT',
        uid: 'future-uid',
        positionUid: 'position-uid',
        name: 'USD/RUB Futures',
        currency: 'rub',
        lot: 1,
        exchange: 'MOEX',
        realExchange: 'REAL_EXCHANGE_MOEX',
        sector: 'Currencies',
        firstTradeDate: '2026-03-01T00:00:00.000Z',
        lastTradeDate: '2026-06-18T00:00:00.000Z',
        expirationDate: '2026-06-19T00:00:00.000Z',
        futuresType: 'cash_settlement',
        assetType: 'currency',
        basicAsset: 'USD/RUB',
        basicAssetSize: '1000',
        basicAssetPositionUid: 'basic-position-uid',
        klong: '2',
        kshort: '1.5',
        dlong: '0.1',
        dshort: '0.2',
        dlongMin: '0.3',
        dshortMin: '0.4',
        minPriceIncrement: '0.001',
        tradingStatus: 'SECURITY_TRADING_STATUS_NORMAL_TRADING',
        countryOfRisk: 'RU',
        countryOfRiskName: 'Russia',
        otcFlag: false,
        buyAvailableFlag: true,
        sellAvailableFlag: true,
        apiTradeAvailableFlag: true,
        shortEnabledFlag: true,
        forIisFlag: true,
        forQualInvestorFlag: false,
        weekendFlag: false,
        blockedTcaFlag: false,
        first1minCandleDate: '2026-06-19T10:00:00.000Z',
        first1dayCandleDate: '2026-06-20T00:00:00.000Z'
      });
    });

    test('returns null when response has no instrument', () => {
      assert.equal(createFutureReport(response({ instrument: undefined })), null);
    });
  });

  describe('formatFutureReport', () => {
    test('formats report as table', () => {
      const output = formatFutureReport(createFutureReport(response()), 'table');

      assert.match(output, /^figi\s+ticker\s+classCode\s+uid\s+positionUid\s+name/m);
      assert.match(output, /FUTFIGI\s+SiM6\s+SPBFUT\s+future-uid/);
      assert.match(output, /USD\/RUB Futures\s+rub\s+1\s+MOEX\s+Currencies\s+cash_settlement/);
      assert.doesNotMatch(output, /basic-position-uid/);
    });

    test('formats report as json', () => {
      const output = formatFutureReport(createFutureReport(response()), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed.figi, 'FUTFIGI');
      assert.equal(parsed.basicAsset, 'USD/RUB');
      assert.equal(parsed.basicAssetPositionUid, 'basic-position-uid');
      assert.equal(parsed.expirationDate, '2026-06-19T00:00:00.000Z');
    });

    test('formats missing future as json null and table header', () => {
      assert.equal(formatFutureReport(null, 'json'), 'null\n');
      assert.match(formatFutureReport(null, 'table'), /^figi\s+ticker\s+classCode/);
    });
  });
});
