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
import type { Currency } from '../../../generated/instruments';
import { createCurrenciesReport, formatCurrenciesReport } from './reporter';

function quotation(units: number, nano: number): Quotation {
  return { units, nano };
}

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return { units, nano, currency };
}

function currency(overrides: Partial<Currency> = {}): Currency {
  return {
    figi: 'BBG0013HGFT4',
    ticker: 'USD000UTSTOM',
    classCode: 'CETS',
    isin: 'USD000UTSTOM',
    lot: 1000,
    currency: 'rub',
    dlong: quotation(0, 100000000),
    dshort: quotation(0, 200000000),
    dlongMin: quotation(0, 300000000),
    dshortMin: quotation(0, 400000000),
    shortEnabledFlag: true,
    name: 'US Dollar',
    exchange: 'MOEX',
    nominal: money(1, 0, 'usd'),
    countryOfRisk: 'US',
    countryOfRiskName: 'United States',
    tradingStatus: SecurityTradingStatus.SECURITY_TRADING_STATUS_NORMAL_TRADING,
    otcFlag: false,
    buyAvailableFlag: true,
    sellAvailableFlag: true,
    isoCurrencyName: 'USD',
    minPriceIncrement: quotation(0, 2500000),
    apiTradeAvailableFlag: true,
    uid: 'currency-uid',
    realExchange: RealExchange.REAL_EXCHANGE_MOEX,
    positionUid: 'position-uid',
    forIisFlag: true,
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    first1minCandleDate: new Date('2026-06-19T10:00:00.000Z'),
    first1dayCandleDate: new Date('2026-06-20T00:00:00.000Z'),
    ...overrides
  } as Currency;
}

describe('currencies reporter', () => {
  describe('createCurrenciesReport', () => {
    test('maps generated currencies to stable report values', () => {
      const report = createCurrenciesReport([currency()]);

      assert.deepEqual(report, [
        {
          figi: 'BBG0013HGFT4',
          ticker: 'USD000UTSTOM',
          classCode: 'CETS',
          isin: 'USD000UTSTOM',
          uid: 'currency-uid',
          positionUid: 'position-uid',
          name: 'US Dollar',
          currency: 'rub',
          isoCurrencyName: 'USD',
          lot: 1000,
          exchange: 'MOEX',
          realExchange: 'REAL_EXCHANGE_MOEX',
          nominal: {
            currency: 'usd',
            amount: '1'
          },
          dlong: '0.1',
          dshort: '0.2',
          dlongMin: '0.3',
          dshortMin: '0.4',
          minPriceIncrement: '0.0025',
          tradingStatus: 'SECURITY_TRADING_STATUS_NORMAL_TRADING',
          countryOfRisk: 'US',
          countryOfRiskName: 'United States',
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
        }
      ]);
    });
  });

  describe('formatCurrenciesReport', () => {
    test('formats report as table', () => {
      const output = formatCurrenciesReport(createCurrenciesReport([currency()]), 'table');

      assert.match(output, /^figi\s+ticker\s+classCode\s+uid\s+positionUid\s+name/m);
      assert.match(output, /BBG0013HGFT4\s+USD000UTSTOM\s+CETS\s+currency-uid/);
      assert.match(output, /US Dollar\s+rub\s+USD\s+1000\s+MOEX/);
      assert.doesNotMatch(output, /0\.0025/);
    });

    test('formats report as json', () => {
      const report = createCurrenciesReport([currency()]);
      const output = formatCurrenciesReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });
  });
});
