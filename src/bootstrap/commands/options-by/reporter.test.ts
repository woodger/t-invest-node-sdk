import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  SecurityTradingStatus,
  type MoneyValue,
  type Quotation
} from '../../../generated/common';
import {
  OptionDirection,
  OptionPaymentType,
  OptionSettlementType,
  OptionStyle,
  RealExchange,
  type Option
} from '../../../generated/instruments';
import { createOptionsByReport, formatOptionsByReport } from './reporter';

function quotation(units: number, nano: number): Quotation {
  return { units, nano };
}

function money(currency: string, units: number, nano: number): MoneyValue {
  return { currency, units, nano };
}

function option(overrides: Partial<Option> = {}): Option {
  return {
    uid: 'option-uid',
    positionUid: 'option-position-uid',
    ticker: 'SiM6C125000',
    classCode: 'SPBOPT',
    basicAssetPositionUid: 'asset-position-uid',
    tradingStatus: SecurityTradingStatus.SECURITY_TRADING_STATUS_NORMAL_TRADING,
    realExchange: RealExchange.REAL_EXCHANGE_MOEX,
    direction: OptionDirection.OPTION_DIRECTION_CALL,
    paymentType: OptionPaymentType.OPTION_PAYMENT_TYPE_PREMIUM,
    style: OptionStyle.OPTION_STYLE_AMERICAN,
    settlementType: OptionSettlementType.OPTION_EXECUTION_TYPE_CASH_SETTLEMENT,
    name: 'USD/RUB Call Option',
    currency: 'rub',
    settlementCurrency: 'rub',
    assetType: 'currency',
    basicAsset: 'USD/RUB',
    exchange: 'MOEX',
    countryOfRisk: 'RU',
    countryOfRiskName: 'Russia',
    sector: 'Currencies',
    lot: 1,
    basicAssetSize: quotation(1000, 0),
    klong: quotation(2, 0),
    kshort: quotation(1, 500000000),
    dlong: quotation(0, 100000000),
    dshort: quotation(0, 200000000),
    dlongMin: quotation(0, 300000000),
    dshortMin: quotation(0, 400000000),
    minPriceIncrement: quotation(0, 1000000),
    strikePrice: money('rub', 12500, 500000000),
    expirationDate: new Date('2026-06-19T00:00:00.000Z'),
    firstTradeDate: new Date('2026-03-01T00:00:00.000Z'),
    lastTradeDate: new Date('2026-06-18T00:00:00.000Z'),
    first1minCandleDate: new Date('2026-06-19T10:00:00.000Z'),
    first1dayCandleDate: new Date('2026-06-20T00:00:00.000Z'),
    shortEnabledFlag: true,
    forIisFlag: true,
    otcFlag: false,
    buyAvailableFlag: true,
    sellAvailableFlag: true,
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    apiTradeAvailableFlag: true,
    ...overrides
  };
}

describe('options-by reporter', () => {
  describe('createOptionsByReport', () => {
    test('maps generated options to stable report values', () => {
      const report = createOptionsByReport([option()]);

      assert.deepEqual(report, [
        {
          uid: 'option-uid',
          positionUid: 'option-position-uid',
          ticker: 'SiM6C125000',
          classCode: 'SPBOPT',
          name: 'USD/RUB Call Option',
          currency: 'rub',
          settlementCurrency: 'rub',
          lot: 1,
          exchange: 'MOEX',
          realExchange: 'REAL_EXCHANGE_MOEX',
          sector: 'Currencies',
          tradingStatus: 'SECURITY_TRADING_STATUS_NORMAL_TRADING',
          direction: 'OPTION_DIRECTION_CALL',
          paymentType: 'OPTION_PAYMENT_TYPE_PREMIUM',
          style: 'OPTION_STYLE_AMERICAN',
          settlementType: 'OPTION_EXECUTION_TYPE_CASH_SETTLEMENT',
          assetType: 'currency',
          basicAsset: 'USD/RUB',
          basicAssetSize: '1000',
          basicAssetPositionUid: 'asset-position-uid',
          strikePrice: {
            currency: 'rub',
            amount: '12500.5'
          },
          expirationDate: '2026-06-19T00:00:00.000Z',
          firstTradeDate: '2026-03-01T00:00:00.000Z',
          lastTradeDate: '2026-06-18T00:00:00.000Z',
          klong: '2',
          kshort: '1.5',
          dlong: '0.1',
          dshort: '0.2',
          dlongMin: '0.3',
          dshortMin: '0.4',
          minPriceIncrement: '0.001',
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
        }
      ]);
    });
  });

  describe('formatOptionsByReport', () => {
    test('formats report as table', () => {
      const output = formatOptionsByReport(createOptionsByReport([option()]), 'table');

      assert.match(output, /^uid\s+positionUid\s+ticker\s+classCode\s+name/m);
      assert.match(output, /option-uid\s+option-position-uid\s+SiM6C125000\s+SPBOPT/);
      assert.match(output, /USD\/RUB Call Option\s+rub\s+1\s+MOEX\s+Currencies\s+OPTION_DIRECTION_CALL/);
      assert.match(output, /12500\.5 rub\s+2026-06-19T00:00:00\.000Z/);
      assert.doesNotMatch(output, /asset-position-uid/);
    });

    test('formats report as json', () => {
      const output = formatOptionsByReport(createOptionsByReport([option()]), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].uid, 'option-uid');
      assert.equal(parsed[0].direction, 'OPTION_DIRECTION_CALL');
      assert.equal(parsed[0].basicAsset, 'USD/RUB');
      assert.equal(parsed[0].basicAssetPositionUid, 'asset-position-uid');
      assert.deepEqual(parsed[0].strikePrice, {
        currency: 'rub',
        amount: '12500.5'
      });
    });
  });
});
