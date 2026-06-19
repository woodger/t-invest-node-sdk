import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  CandleInterval,
  type GetCandlesRequest,
  type HistoricCandle
} from '../../../generated/marketdata';
import type { CliArgs } from '../../cli-contract';
import {
  createCandlesCommand,
  formatCandles,
  parseCandleInterval,
  parseCandlesFormat,
  parseCandlesRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['candles'],
    ...args
  };
}

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
  };
}

describe('candles command', () => {
  describe('parseCandleInterval', () => {
    test('maps public interval names to generated enum values', () => {
      assert.equal(
        parseCandleInterval(argv({ interval: '1min' })),
        CandleInterval.CANDLE_INTERVAL_1_MIN
      );
      assert.equal(
        parseCandleInterval(argv({ interval: 'day' })),
        CandleInterval.CANDLE_INTERVAL_DAY
      );
    });

    test('throws for unsupported interval names', () => {
      assert.throws(
        () => parseCandleInterval(argv({ interval: 'year' })),
        /Expected '--interval' as one of:/
      );
    });
  });

  describe('parseCandlesRequest', () => {
    test('returns generated getCandles request', () => {
      const request = parseCandlesRequest(argv({
        'instrument-id': 'BBG00QPYJ5H0',
        from: '2026-06-19T00:00:00.000Z',
        to: '2026-06-19T01:00:00.000Z',
        interval: 'hour'
      }));

      assert.equal(request.instrumentId, 'BBG00QPYJ5H0');
      assert.equal(request.figi, '');
      assert.equal(request.from?.toISOString(), '2026-06-19T00:00:00.000Z');
      assert.equal(request.to?.toISOString(), '2026-06-19T01:00:00.000Z');
      assert.equal(request.interval, CandleInterval.CANDLE_INTERVAL_HOUR);
    });

    test('throws when from is later than to', () => {
      assert.throws(
        () => parseCandlesRequest(argv({
          'instrument-id': 'BBG00QPYJ5H0',
          from: '2026-06-20T00:00:00.000Z',
          to: '2026-06-19T00:00:00.000Z',
          interval: 'day'
        })),
        /Expected '--from' to be earlier/
      );
    });
  });

  describe('parseCandlesFormat', () => {
    test('returns json by default', () => {
      assert.equal(parseCandlesFormat(argv()), 'json');
    });
  });

  describe('formatCandles', () => {
    test('formats candles as json', () => {
      const output = formatCandles([candle()], 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].time, '2026-06-19T00:00:00.000Z');
      assert.equal(parsed[0].open, '10.5');
      assert.equal(parsed[0].high, '11');
      assert.equal(parsed[0].low, '9.25');
      assert.equal(parsed[0].close, '10.75');
      assert.equal(parsed[0].volume, 42);
      assert.equal(parsed[0].isComplete, true);
    });

    test('formats candles as csv', () => {
      const output = formatCandles([candle()], 'csv');

      assert.match(output, /^time,open,high,low,close,volume,isComplete/);
      assert.match(output, /2026-06-19T00:00:00.000Z,10.5,11,9.25,10.75,42,true/);
    });
  });

  describe('createCandlesCommand', () => {
    test('calls getCandles and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetCandlesRequest | undefined;
      let closeCalls = 0;
      const command = createCandlesCommand((options) => {
        receivedOptions = options;

        return {
          marketdata: {
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

      const output = await command(argv({
        token: 'token',
        endpoint: 'localhost:50051',
        'instrument-id': 'BBG00QPYJ5H0',
        from: '2026-06-19T00:00:00.000Z',
        to: '2026-06-19T01:00:00.000Z',
        interval: '1min',
        format: 'csv'
      }));

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
