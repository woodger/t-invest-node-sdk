import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import {
  RealExchange,
  SecurityTradingStatus,
  type MoneyValue,
  type Quotation
} from '../../../generated/common';
import { RiskLevel, type Bond } from '../../../generated/instruments';
import { createBondsReport, formatBondsReport } from './reporter';

function quotation(units: number, nano: number): Quotation {
  return { units, nano };
}

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return { units, nano, currency };
}

function bond(overrides: Partial<Bond> = {}): Bond {
  return {
    figi: 'BBG00B9XRY4J',
    ticker: 'SU26238RMFS4',
    classCode: 'TQOB',
    isin: 'RU000A1038V6',
    lot: 1,
    currency: 'rub',
    dlong: quotation(0, 100000000),
    dshort: quotation(0, 200000000),
    dlongMin: quotation(0, 300000000),
    dshortMin: quotation(0, 400000000),
    shortEnabledFlag: true,
    name: 'OFZ 26238',
    exchange: 'MOEX',
    couponQuantityPerYear: 2,
    maturityDate: new Date('2041-05-15T00:00:00.000Z'),
    nominal: money(1000, 0, 'rub'),
    initialNominal: money(1000, 0, 'rub'),
    stateRegDate: new Date('2021-06-16T00:00:00.000Z'),
    placementDate: new Date('2021-06-30T00:00:00.000Z'),
    placementPrice: money(99, 500000000, 'rub'),
    aciValue: money(12, 340000000, 'rub'),
    countryOfRisk: 'RU',
    countryOfRiskName: 'Russia',
    sector: 'Government',
    issueKind: 'non_documentary',
    issueSize: 1000000,
    issueSizePlan: 2000000,
    tradingStatus: SecurityTradingStatus.SECURITY_TRADING_STATUS_NORMAL_TRADING,
    otcFlag: false,
    buyAvailableFlag: true,
    sellAvailableFlag: true,
    floatingCouponFlag: false,
    perpetualFlag: false,
    amortizationFlag: true,
    minPriceIncrement: quotation(0, 10000000),
    apiTradeAvailableFlag: true,
    uid: 'bond-uid',
    realExchange: RealExchange.REAL_EXCHANGE_MOEX,
    positionUid: 'position-uid',
    forIisFlag: true,
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    subordinatedFlag: false,
    liquidityFlag: true,
    first1minCandleDate: new Date('2026-06-19T10:00:00.000Z'),
    first1dayCandleDate: new Date('2026-06-20T00:00:00.000Z'),
    riskLevel: RiskLevel.RISK_LEVEL_LOW,
    ...overrides
  } as Bond;
}

describe('bonds reporter', () => {
  describe('createBondsReport', () => {
    test('maps generated bonds to stable report values', () => {
      const report = createBondsReport([bond()]);

      assert.deepEqual(report, [
        {
          figi: 'BBG00B9XRY4J',
          ticker: 'SU26238RMFS4',
          classCode: 'TQOB',
          isin: 'RU000A1038V6',
          uid: 'bond-uid',
          positionUid: 'position-uid',
          name: 'OFZ 26238',
          currency: 'rub',
          lot: 1,
          exchange: 'MOEX',
          realExchange: 'REAL_EXCHANGE_MOEX',
          sector: 'Government',
          couponQuantityPerYear: 2,
          maturityDate: '2041-05-15T00:00:00.000Z',
          nominal: {
            currency: 'rub',
            amount: '1000'
          },
          initialNominal: {
            currency: 'rub',
            amount: '1000'
          },
          stateRegDate: '2021-06-16T00:00:00.000Z',
          placementDate: '2021-06-30T00:00:00.000Z',
          placementPrice: {
            currency: 'rub',
            amount: '99.5'
          },
          aciValue: {
            currency: 'rub',
            amount: '12.34'
          },
          issueKind: 'non_documentary',
          issueSize: 1000000,
          issueSizePlan: 2000000,
          dlong: '0.1',
          dshort: '0.2',
          dlongMin: '0.3',
          dshortMin: '0.4',
          minPriceIncrement: '0.01',
          tradingStatus: 'SECURITY_TRADING_STATUS_NORMAL_TRADING',
          riskLevel: 'RISK_LEVEL_LOW',
          countryOfRisk: 'RU',
          countryOfRiskName: 'Russia',
          otcFlag: false,
          buyAvailableFlag: true,
          sellAvailableFlag: true,
          floatingCouponFlag: false,
          perpetualFlag: false,
          amortizationFlag: true,
          apiTradeAvailableFlag: true,
          shortEnabledFlag: true,
          forIisFlag: true,
          forQualInvestorFlag: false,
          weekendFlag: false,
          blockedTcaFlag: false,
          subordinatedFlag: false,
          liquidityFlag: true,
          first1minCandleDate: '2026-06-19T10:00:00.000Z',
          first1dayCandleDate: '2026-06-20T00:00:00.000Z'
        }
      ]);
    });
  });

  describe('formatBondsReport', () => {
    test('formats report as table', () => {
      const output = formatBondsReport(createBondsReport([bond()]), 'table');

      assert.match(output, /^figi\s+ticker\s+classCode\s+uid\s+positionUid\s+name/m);
      assert.match(output, /BBG00B9XRY4J\s+SU26238RMFS4\s+TQOB\s+bond-uid/);
      assert.match(output, /OFZ 26238\s+rub\s+1\s+MOEX\s+Government\s+2041-05-15T00:00:00.000Z/);
      assert.doesNotMatch(output, /99\.5/);
    });

    test('formats report as json', () => {
      const report = createBondsReport([bond()]);
      const output = formatBondsReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });
  });
});
