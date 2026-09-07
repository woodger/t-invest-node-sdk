import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { GetFuturesMarginResponse } from '../../../generated/instruments';
import { createFuturesMarginReport, formatFuturesMarginReport } from './reporter';

function response(overrides: Partial<GetFuturesMarginResponse> = {}): GetFuturesMarginResponse {
  return {
    initialMarginOnBuy: {
      currency: 'rub',
      units: 1000,
      nano: 250_000_000
    },
    initialMarginOnSell: {
      currency: 'rub',
      units: 1100,
      nano: 0
    },
    minPriceIncrement: {
      units: 1,
      nano: 0
    },
    minPriceIncrementAmount: {
      units: 10,
      nano: 500_000_000
    },
    ...overrides
  } as GetFuturesMarginResponse;
}

describe('futures-margin reporter', () => {
  describe('createFuturesMarginReport', () => {
    test('maps generated futures margin to stable report values', () => {
      const report = createFuturesMarginReport(response());

      assert.deepEqual(report, {
        initialMarginOnBuy: {
          currency: 'rub',
          amount: '1000.25'
        },
        initialMarginOnSell: {
          currency: 'rub',
          amount: '1100'
        },
        minPriceIncrement: '1',
        minPriceIncrementAmount: '10.5'
      });
    });

    test('maps missing values to nulls and empty strings', () => {
      const report = createFuturesMarginReport(response({
        initialMarginOnBuy: undefined,
        initialMarginOnSell: undefined,
        minPriceIncrement: undefined,
        minPriceIncrementAmount: undefined
      }));

      assert.deepEqual(report, {
        initialMarginOnBuy: null,
        initialMarginOnSell: null,
        minPriceIncrement: '',
        minPriceIncrementAmount: ''
      });
    });
  });

  describe('formatFuturesMarginReport', () => {
    test('formats report as table', () => {
      const output = formatFuturesMarginReport(createFuturesMarginReport(response()), 'table');

      assert.match(output, /^initialMarginOnBuy\s+initialMarginOnSell\s+minPriceIncrement/m);
      assert.match(output, /1000\.25 rub\s+1100 rub\s+1\s+10\.5/);
    });

    test('formats report as json', () => {
      const report = createFuturesMarginReport(response());
      const output = formatFuturesMarginReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });
  });
});
