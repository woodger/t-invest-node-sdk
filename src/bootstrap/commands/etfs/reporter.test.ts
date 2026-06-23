import assert from 'node:assert';
import { describe, test } from 'node:test';
import { SecurityTradingStatus, type Quotation } from '../../../generated/common';
import {
  RealExchange,
  type Etf
} from '../../../generated/instruments';
import { createEtfsReport, formatEtfsReport } from './reporter';

function quotation(units: number, nano: number): Quotation {
  return { units, nano };
}

function etf(overrides: Partial<Etf> = {}): Etf {
  return {
    figi: 'BBG333333333',
    ticker: 'TMOS',
    classCode: 'TQTF',
    isin: 'RU000A101X76',
    lot: 1,
    currency: 'rub',
    klong: quotation(2, 0),
    kshort: quotation(1, 500000000),
    dlong: quotation(0, 100000000),
    dshort: quotation(0, 200000000),
    dlongMin: quotation(0, 300000000),
    dshortMin: quotation(0, 400000000),
    shortEnabledFlag: true,
    name: 'T-Bank MOEX ETF',
    exchange: 'MOEX',
    fixedCommission: quotation(0, 790000000),
    focusType: 'equity',
    releasedDate: new Date('2020-01-20T00:00:00.000Z'),
    numShares: quotation(1000000, 0),
    countryOfRisk: 'RU',
    countryOfRiskName: 'Russia',
    sector: 'Financials',
    rebalancingFreq: 'daily',
    tradingStatus: SecurityTradingStatus.SECURITY_TRADING_STATUS_NORMAL_TRADING,
    otcFlag: false,
    buyAvailableFlag: true,
    sellAvailableFlag: true,
    minPriceIncrement: quotation(0, 10000000),
    apiTradeAvailableFlag: true,
    uid: 'etf-uid',
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
  };
}

describe('etfs reporter', () => {
  describe('createEtfsReport', () => {
    test('maps generated etfs to stable report values', () => {
      const report = createEtfsReport([etf()]);

      assert.deepEqual(report, [
        {
          figi: 'BBG333333333',
          ticker: 'TMOS',
          classCode: 'TQTF',
          isin: 'RU000A101X76',
          uid: 'etf-uid',
          positionUid: 'position-uid',
          name: 'T-Bank MOEX ETF',
          currency: 'rub',
          lot: 1,
          exchange: 'MOEX',
          realExchange: 'REAL_EXCHANGE_MOEX',
          sector: 'Financials',
          focusType: 'equity',
          rebalancingFreq: 'daily',
          fixedCommission: '0.79',
          releasedDate: '2020-01-20T00:00:00.000Z',
          numShares: '1000000',
          klong: '2',
          kshort: '1.5',
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
          apiTradeAvailableFlag: true,
          shortEnabledFlag: true,
          forIisFlag: true,
          forQualInvestorFlag: false,
          weekendFlag: false,
          blockedTcaFlag: false,
          liquidityFlag: true,
          first1minCandleDate: '2026-06-19T10:00:00.000Z',
          first1dayCandleDate: '2026-06-20T00:00:00.000Z'
        }
      ]);
    });
  });

  describe('formatEtfsReport', () => {
    test('formats report as table', () => {
      const output = formatEtfsReport(createEtfsReport([etf()]), 'table');

      assert.match(output, /^figi\s+ticker\s+classCode\s+uid\s+positionUid\s+name/m);
      assert.match(output, /BBG333333333\s+TMOS\s+TQTF\s+etf-uid/);
      assert.match(output, /T-Bank MOEX ETF\s+rub\s+1\s+MOEX\s+Financials\s+equity/);
      assert.doesNotMatch(output, /0\.79/);
    });

    test('formats report as json', () => {
      const output = formatEtfsReport(createEtfsReport([etf()]), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].figi, 'BBG333333333');
      assert.equal(parsed[0].focusType, 'equity');
      assert.equal(parsed[0].fixedCommission, '0.79');
      assert.equal(parsed[0].releasedDate, '2020-01-20T00:00:00.000Z');
    });
  });
});
