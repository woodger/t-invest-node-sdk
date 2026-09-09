import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  CandleInterval,
  GetCandlesRequest,
  type HistoricCandle
} from '../../../generated/marketdata';
import { createCandlesCommand, createCandlesRequest } from './cli';

function candle(overrides: Partial<HistoricCandle> = {}): HistoricCandle {
  return {
    open: { units: 10, nano: 500000000 },
    high: { units: 11, nano: 0 },
    low: { units: 9, nano: 250000000 },
    close: { units: 10, nano: 750000000 },
    volume: 42,
    time: new Date('2026-06-19T00:00:00.000Z'),
    isComplete: true,
    ...overrides
  } as HistoricCandle;
}

describe('candles command', () => {
  describe('createCandlesRequest', () => {
    test('returns generated getCandles request', () => {
      const request = createCandlesRequest({
        'instrument-id': 'BBG00QPYJ5H0',
        from: '2026-06-19T00:00:00.000Z',
        to: '2026-06-19T01:00:00.000Z',
        interval: 'hour'
      });

      assert.equal(request.instrumentId, 'BBG00QPYJ5H0');
      assert.equal(request.from?.toISOString(), '2026-06-19T00:00:00.000Z');
      assert.equal(request.to?.toISOString(), '2026-06-19T01:00:00.000Z');
      assert.equal(request.interval, CandleInterval.CANDLE_INTERVAL_HOUR);
      assert.doesNotMatch(
        JSON.stringify(GetCandlesRequest.toJSON(request)),
        /"figi":/
      );
    });

    test('maps minute and day intervals to generated values', () => {
      const cases = [
        ['1min', CandleInterval.CANDLE_INTERVAL_1_MIN],
        ['day', CandleInterval.CANDLE_INTERVAL_DAY]
      ] as const;

      for (const [interval, expected] of cases) {
        const request = createCandlesRequest({
          'instrument-id': 'instrument-id',
          from: '2026-06-19T00:00:00.000Z',
          to: '2026-06-19T01:00:00.000Z',
          interval
        });

        assert.equal(request.interval, expected);
      }
    });

    test('throws when from is later than to', () => {
      assert.throws(
        () => createCandlesRequest({
          'instrument-id': 'BBG00QPYJ5H0',
          from: '2026-06-20T00:00:00.000Z',
          to: '2026-06-19T00:00:00.000Z',
          interval: 'day'
        }),
        /Expected '--from' to be earlier/
      );
    });
  });

  describe('createCandlesCommand', () => {
    test('calls getCandles and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: GetCandlesRequest | undefined;
      let closeCalls = 0;
      const command = createCandlesCommand((options) => {
        receivedOptions = options;

        return {
    marketData: {
            async getCandles(request) {
              receivedRequest = request;

              return {
                candles: [candle()]
              };
            }
          },
          close() {
            closeCalls += 1;
          }
        };
      });

      const output = await commandFacade.run(
        command,
        [
          'market',
          'candles',
          '--token=token',
          '--endpoint=localhost:50051',
          '--instrument-id=BBG00QPYJ5H0',
          '--from=2026-06-19T00:00:00.000Z',
          '--to=2026-06-19T01:00:00.000Z',
          '--interval=1min',
          '--format=csv'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(receivedRequest?.instrumentId, 'BBG00QPYJ5H0');
      assert.equal(receivedRequest?.interval, CandleInterval.CANDLE_INTERVAL_1_MIN);
      assert.equal(closeCalls, 1);
      assert.match(output, /10.5/);
    });
  });
});
