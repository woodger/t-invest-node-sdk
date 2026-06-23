import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { Quotation } from '../../../generated/common';
import {
  TradeDirection,
  type GetLastTradesRequest,
  type GetLastTradesResponse,
  type Trade
} from '../../../generated/marketdata';
import type { CliArgs } from '../../cli-contract';
import {
  createLastTradesCommand,
  parseLastTradesFormat,
  parseLastTradesRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['marketdata get-last-trades'],
    ...args
  };
}

function quotation(units: number, nano: number): Quotation {
  return {
    units,
    nano
  };
}

function trade(overrides: Partial<Trade> = {}): Trade {
  return {
    figi: 'BBG00QPYJ5H0',
    direction: TradeDirection.TRADE_DIRECTION_BUY,
    price: quotation(100, 500000000),
    quantity: 10,
    time: new Date('2026-06-19T10:00:00.000Z'),
    instrumentUid: 'instrument-uid',
    ...overrides
  };
}

function lastTradesResponse(
  overrides: Partial<GetLastTradesResponse> = {}
): GetLastTradesResponse {
  return {
    trades: [trade()],
    ...overrides
  };
}

describe('last-trades command', () => {
  describe('parseLastTradesRequest', () => {
    test('returns generated getLastTrades request', () => {
      const request = parseLastTradesRequest(argv({
        'instrument-id': 'BBG00QPYJ5H0',
        from: '2026-06-19T10:00:00.000Z',
        to: '2026-06-19T11:00:00.000Z'
      }));

      assert.equal(request.instrumentId, 'BBG00QPYJ5H0');
      assert.equal(request.figi, '');
      assert.equal(request.from?.toISOString(), '2026-06-19T10:00:00.000Z');
      assert.equal(request.to?.toISOString(), '2026-06-19T11:00:00.000Z');
    });

    test('throws when from is later than to', () => {
      assert.throws(
        () => parseLastTradesRequest(argv({
          'instrument-id': 'BBG00QPYJ5H0',
          from: '2026-06-19T11:00:00.000Z',
          to: '2026-06-19T10:00:00.000Z'
        })),
        /Expected '--from' to be earlier/
      );
    });
  });

  describe('parseLastTradesFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseLastTradesFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseLastTradesFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createLastTradesCommand', () => {
    test('calls getLastTrades and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetLastTradesRequest | undefined;
      let closeCalls = 0;
      const command = createLastTradesCommand((options) => {
        receivedOptions = options;

        return {
          marketdata: {
            async getLastTrades(request) {
              receivedRequest = request;

              return lastTradesResponse();
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
        from: '2026-06-19T10:00:00.000Z',
        to: '2026-06-19T11:00:00.000Z',
        format: 'json'
      }));

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(receivedRequest?.instrumentId, 'BBG00QPYJ5H0');
      assert.equal(receivedRequest?.from?.toISOString(), '2026-06-19T10:00:00.000Z');
      assert.equal(receivedRequest?.to?.toISOString(), '2026-06-19T11:00:00.000Z');
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].figi, 'BBG00QPYJ5H0');
    });

    test('closes sdk when getLastTrades rejects', async () => {
      let closeCalls = 0;
      const command = createLastTradesCommand(() => ({
        marketdata: {
          async getLastTrades() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => command(argv({
          token: 'token',
          endpoint: 'localhost:50051',
          'instrument-id': 'BBG00QPYJ5H0',
          from: '2026-06-19T10:00:00.000Z',
          to: '2026-06-19T11:00:00.000Z'
        })),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
