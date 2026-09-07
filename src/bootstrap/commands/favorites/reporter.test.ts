import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { InstrumentType } from '../../../generated/common';
import type { FavoriteInstrument
} from '../../../generated/instruments';
import { createFavoritesReport, formatFavoritesReport } from './reporter';

function favoriteInstrument(overrides: Partial<FavoriteInstrument> = {}): FavoriteInstrument {
  return {
    figi: 'BBG00QPYJ5H0',
    ticker: 'TCSG',
    classCode: 'TQBR',
    isin: 'RU000A107UL4',
    instrumentType: 'share',
    otcFlag: false,
    apiTradeAvailableFlag: true,
    instrumentKind: InstrumentType.INSTRUMENT_TYPE_SHARE,
    ...overrides
  } as FavoriteInstrument;
}

describe('favorites reporter', () => {
  describe('createFavoritesReport', () => {
    test('maps generated favorites to stable report values', () => {
      const report = createFavoritesReport([favoriteInstrument()]);

      assert.deepEqual(report, [
        {
          figi: 'BBG00QPYJ5H0',
          ticker: 'TCSG',
          classCode: 'TQBR',
          isin: 'RU000A107UL4',
          instrumentType: 'share',
          instrumentKind: 'INSTRUMENT_TYPE_SHARE',
          otcFlag: false,
          apiTradeAvailableFlag: true
        }
      ]);
    });
  });

  describe('formatFavoritesReport', () => {
    test('formats report as table', () => {
      const output = formatFavoritesReport(
        createFavoritesReport([favoriteInstrument()]),
        'table'
      );

      assert.match(output, /^figi\s+ticker\s+classCode\s+isin\s+instrumentType/m);
      assert.match(output, /BBG00QPYJ5H0\s+TCSG\s+TQBR\s+RU000A107UL4\s+share/);
    });

    test('formats report as json', () => {
      const report = createFavoritesReport([favoriteInstrument()]);
      const output = formatFavoritesReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });
  });
});
