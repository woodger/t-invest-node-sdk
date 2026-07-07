import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  TradingDay,
  TradingSchedulesRequest,
  TradingSchedulesResponse
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createTradingSchedulesCommand,
  parseTradingSchedulesFormat,
  createTradingSchedulesRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function tradingDay(overrides: Partial<TradingDay> = {}): TradingDay {
  return {
    date: new Date('2026-01-02T00:00:00Z'),
    isTradingDay: true,
    startTime: new Date('2026-01-02T07:00:00Z'),
    endTime: new Date('2026-01-02T16:00:00Z'),
    openingAuctionStartTime: undefined,
    closingAuctionEndTime: undefined,
    eveningOpeningAuctionStartTime: undefined,
    eveningStartTime: undefined,
    eveningEndTime: undefined,
    clearingStartTime: undefined,
    clearingEndTime: undefined,
    premarketStartTime: undefined,
    premarketEndTime: undefined,
    closingAuctionStartTime: undefined,
    openingAuctionEndTime: undefined,
    ...overrides
  };
}

function response(overrides: Partial<TradingSchedulesResponse> = {}): TradingSchedulesResponse {
  return {
    exchanges: [
      {
        exchange: 'MOEX',
        days: [tradingDay()]
      }
    ],
    ...overrides
  };
}

describe('trading-schedules command', () => {
  describe('createTradingSchedulesRequest', () => {
    test('returns generated tradingSchedules request', () => {
      const request = createTradingSchedulesRequest({
        exchange: 'MOEX',
        from: '2026-01-01T00:00:00Z',
        to: '2026-01-31T00:00:00Z'
      });

      assert.deepEqual(request, {
        exchange: 'MOEX',
        from: new Date('2026-01-01T00:00:00Z'),
        to: new Date('2026-01-31T00:00:00Z')
      });
    });

    test('uses empty exchange when omitted', () => {
      const request = createTradingSchedulesRequest({
        from: '2026-01-01T00:00:00Z',
        to: '2026-01-31T00:00:00Z'
      });

      assert.equal(request.exchange, '');
    });

    test('rejects inverted date range', () => {
      assert.throws(
        () => createTradingSchedulesRequest({
          from: '2026-02-01T00:00:00Z',
          to: '2026-01-01T00:00:00Z'
        }),
        /Expected '--from' to be earlier than or equal to '--to'/
      );
    });
  });

  describe('parseTradingSchedulesFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseTradingSchedulesFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseTradingSchedulesFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createTradingSchedulesCommand', () => {
    test('calls tradingSchedules and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: TradingSchedulesRequest | undefined;
      let tradingSchedulesCalls = 0;
      let closeCalls = 0;
      const command = createTradingSchedulesCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async tradingSchedules(request) {
              receivedRequest = request;
              tradingSchedulesCalls += 1;

              return response();
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
          'instrument',
          'trading-schedules',
          '--token=token',
          '--endpoint=localhost:50051',
          '--exchange=MOEX',
          '--from=2026-01-01T00:00:00Z',
          '--to=2026-01-31T00:00:00Z',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(tradingSchedulesCalls, 1);
      assert.deepEqual(receivedRequest, {
        exchange: 'MOEX',
        from: new Date('2026-01-01T00:00:00Z'),
        to: new Date('2026-01-31T00:00:00Z')
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].exchange, 'MOEX');
    });

    test('closes sdk when tradingSchedules rejects', async () => {
      let closeCalls = 0;
      const command = createTradingSchedulesCommand(() => ({
        instruments: {
          async tradingSchedules() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'instrument',
            'trading-schedules',
            '--token=token',
            '--endpoint=localhost:50051',
            '--from=2026-01-01T00:00:00Z',
            '--to=2026-01-31T00:00:00Z'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
