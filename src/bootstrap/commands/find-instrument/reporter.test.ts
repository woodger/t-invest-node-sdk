import assert from 'node:assert';
import { describe, test } from 'node:test';
import { InstrumentType } from '../../../generated/common';
import type { InstrumentShort } from '../../../generated/instruments';
import { createFindInstrumentReport, formatFindInstrumentReport } from './reporter';

function instrument(overrides: Partial<InstrumentShort> = {}): InstrumentShort {
  return {
    isin: 'RU000A107UL4',
    figi: 'BBG00QPYJ5H0',
    ticker: 'TCSG',
    classCode: 'TQBR',
    instrumentType: 'share',
    name: 'TCS Group',
    uid: 'instrument-uid',
    positionUid: 'position-uid',
    instrumentKind: InstrumentType.INSTRUMENT_TYPE_SHARE,
    apiTradeAvailableFlag: true,
    forIisFlag: true,
    first1minCandleDate: new Date('2026-01-02T03:04:05Z'),
    first1dayCandleDate: new Date('2026-01-03T03:04:05Z'),
    forQualInvestorFlag: false,
    weekendFlag: false,
    blockedTcaFlag: false,
    ...overrides
  };
}

describe('find-instrument reporter', () => {
  describe('createFindInstrumentReport', () => {
    test('maps generated instruments to stable report values', () => {
      const report = createFindInstrumentReport([instrument()]);

      assert.deepEqual(report, [
        {
          isin: 'RU000A107UL4',
          figi: 'BBG00QPYJ5H0',
          ticker: 'TCSG',
          classCode: 'TQBR',
          instrumentType: 'share',
          name: 'TCS Group',
          uid: 'instrument-uid',
          positionUid: 'position-uid',
          instrumentKind: 'INSTRUMENT_TYPE_SHARE',
          apiTradeAvailableFlag: true,
          forIisFlag: true,
          forQualInvestorFlag: false,
          weekendFlag: false,
          blockedTcaFlag: false,
          first1minCandleDate: '2026-01-02T03:04:05.000Z',
          first1dayCandleDate: '2026-01-03T03:04:05.000Z'
        }
      ]);
    });

    test('maps missing dates to empty strings', () => {
      const report = createFindInstrumentReport([
        instrument({
          first1minCandleDate: undefined,
          first1dayCandleDate: undefined
        })
      ]);

      assert.equal(report[0].first1minCandleDate, '');
      assert.equal(report[0].first1dayCandleDate, '');
    });
  });

  describe('formatFindInstrumentReport', () => {
    test('formats report as table', () => {
      const output = formatFindInstrumentReport(createFindInstrumentReport([instrument()]), 'table');

      assert.match(output, /^figi\s+ticker\s+classCode\s+name\s+uid\s+positionUid/m);
      assert.match(output, /BBG00QPYJ5H0\s+TCSG\s+TQBR\s+TCS Group\s+instrument-uid/);
    });

    test('formats report as json', () => {
      const output = formatFindInstrumentReport(createFindInstrumentReport([instrument()]), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].ticker, 'TCSG');
      assert.equal(parsed[0].instrumentKind, 'INSTRUMENT_TYPE_SHARE');
      assert.equal(parsed[0].apiTradeAvailableFlag, true);
    });
  });
});
