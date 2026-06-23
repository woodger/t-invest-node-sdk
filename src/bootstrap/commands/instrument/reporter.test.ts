import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  InstrumentType,
  SecurityTradingStatus
} from '../../../generated/common';
import {
  RealExchange,
  type Instrument,
  type InstrumentResponse
} from '../../../generated/instruments';
import { createInstrumentReport, formatInstrumentReport } from './reporter';

function instrument(overrides: Partial<Instrument> = {}): Instrument {
  return {
    figi: 'BBG00QPYJ5H0',
    ticker: 'TCSG',
    classCode: 'TQBR',
    isin: 'RU000A107UL4',
    lot: 1,
    currency: 'rub',
    klong: undefined,
    kshort: undefined,
    dlong: undefined,
    dshort: undefined,
    dlongMin: undefined,
    dshortMin: undefined,
    shortEnabledFlag: true,
    name: 'TCS Group',
    exchange: 'MOEX',
    countryOfRisk: 'RU',
    countryOfRiskName: 'Russia',
    instrumentType: 'share',
    tradingStatus: SecurityTradingStatus.SECURITY_TRADING_STATUS_NORMAL_TRADING,
    otcFlag: false,
    buyAvailableFlag: true,
    sellAvailableFlag: true,
    minPriceIncrement: undefined,
    apiTradeAvailableFlag: true,
    uid: 'instrument-uid',
    realExchange: RealExchange.REAL_EXCHANGE_MOEX,
    positionUid: 'position-uid',
    forIisFlag: true,
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    instrumentKind: InstrumentType.INSTRUMENT_TYPE_SHARE,
    first1minCandleDate: new Date('2026-06-19T10:00:00.000Z'),
    first1dayCandleDate: new Date('2026-06-20T00:00:00.000Z'),
    ...overrides
  };
}

function response(overrides: Partial<InstrumentResponse> = {}): InstrumentResponse {
  return {
    instrument: instrument(),
    ...overrides
  };
}

describe('instrument reporter', () => {
  describe('createInstrumentReport', () => {
    test('maps generated instrument fields to stable report values', () => {
      const report = createInstrumentReport(response());

      assert.deepEqual(report, {
        figi: 'BBG00QPYJ5H0',
        ticker: 'TCSG',
        classCode: 'TQBR',
        isin: 'RU000A107UL4',
        uid: 'instrument-uid',
        positionUid: 'position-uid',
        name: 'TCS Group',
        instrumentType: 'share',
        instrumentKind: 'INSTRUMENT_TYPE_SHARE',
        currency: 'rub',
        lot: 1,
        exchange: 'MOEX',
        realExchange: 'REAL_EXCHANGE_MOEX',
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
      assert.equal(createInstrumentReport(response({ instrument: undefined })), null);
    });
  });

  describe('formatInstrumentReport', () => {
    test('formats report as table', () => {
      const output = formatInstrumentReport(createInstrumentReport(response()), 'table');

      assert.match(output, /^figi\s+ticker\s+classCode\s+uid\s+positionUid\s+name/m);
      assert.match(output, /BBG00QPYJ5H0\s+TCSG\s+TQBR\s+instrument-uid\s+position-uid\s+TCS Group/);
      assert.match(output, /share\s+rub\s+1\s+MOEX\s+SECURITY_TRADING_STATUS_NORMAL_TRADING\s+true\s+true/);
    });

    test('formats report as json', () => {
      const output = formatInstrumentReport(createInstrumentReport(response()), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed.figi, 'BBG00QPYJ5H0');
      assert.equal(parsed.uid, 'instrument-uid');
      assert.equal(parsed.instrumentKind, 'INSTRUMENT_TYPE_SHARE');
      assert.equal(parsed.tradingStatus, 'SECURITY_TRADING_STATUS_NORMAL_TRADING');
    });

    test('formats missing instrument as json null and table header', () => {
      assert.equal(formatInstrumentReport(null, 'json'), 'null\n');
      assert.match(formatInstrumentReport(null, 'table'), /^figi\s+ticker\s+classCode/);
    });
  });
});
