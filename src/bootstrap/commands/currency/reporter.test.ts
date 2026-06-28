import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { MoneyValue, Quotation } from '../../../generated/common';
import { SecurityTradingStatus } from '../../../generated/common';
import {
  RealExchange,
  type Currency,
  type CurrencyResponse
} from '../../../generated/instruments';
import { createCurrencyReport, formatCurrencyReport } from './reporter';

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
    klong: quotation(2, 0),
    kshort: quotation(1, 500000000),
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
  };
}

function response(overrides: Partial<CurrencyResponse> = {}): CurrencyResponse {
  return {
    instrument: currency(),
    ...overrides
  };
}

describe('currency reporter', () => {
  describe('createCurrencyReport', () => {
    test('maps generated currency fields to stable report values', () => {
      const report = createCurrencyReport(response());

      assert.deepEqual(report, {
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
        klong: '2',
        kshort: '1.5',
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
      });
    });

    test('returns null when response has no instrument', () => {
      assert.equal(createCurrencyReport(response({ instrument: undefined })), null);
    });
  });

  describe('formatCurrencyReport', () => {
    test('formats report as table', () => {
      const output = formatCurrencyReport(createCurrencyReport(response()), 'table');

      assert.match(output, /^figi\s+ticker\s+classCode\s+uid\s+positionUid\s+name/m);
      assert.match(output, /BBG0013HGFT4\s+USD000UTSTOM\s+CETS\s+currency-uid/);
      assert.match(output, /US Dollar\s+rub\s+USD\s+1000\s+MOEX/);
      assert.doesNotMatch(output, /0\.0025/);
    });

    test('formats report as json', () => {
      const output = formatCurrencyReport(createCurrencyReport(response()), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed.figi, 'BBG0013HGFT4');
      assert.deepEqual(parsed.nominal, {
        currency: 'usd',
        amount: '1'
      });
      assert.equal(parsed.minPriceIncrement, '0.0025');
      assert.equal(parsed.tradingStatus, 'SECURITY_TRADING_STATUS_NORMAL_TRADING');
    });

    test('formats missing currency as json null and table header', () => {
      assert.equal(formatCurrencyReport(null, 'json'), 'null\n');
      assert.match(formatCurrencyReport(null, 'table'), /^figi\s+ticker\s+classCode/);
    });
  });
});
