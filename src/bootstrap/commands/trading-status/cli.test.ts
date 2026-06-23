import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { SecurityTradingStatus } from '../../../generated/common';
import type {
  GetTradingStatusRequest,
  GetTradingStatusResponse
} from '../../../generated/marketdata';
import type { CliArgs } from '../../cli-contract';
import {
  createTradingStatusCommand,
  parseTradingStatusFormat,
  parseTradingStatusRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['marketdata get-trading-status'],
    ...args
  };
}

function response(
  overrides: Partial<GetTradingStatusResponse> = {}
): GetTradingStatusResponse {
  return {
    figi: 'BBG00QPYJ5H0',
    tradingStatus: SecurityTradingStatus.SECURITY_TRADING_STATUS_NORMAL_TRADING,
    limitOrderAvailableFlag: true,
    marketOrderAvailableFlag: false,
    apiTradeAvailableFlag: true,
    instrumentUid: 'instrument-uid',
    ...overrides
  };
}

describe('trading-status command', () => {
  describe('parseTradingStatusRequest', () => {
    test('returns generated getTradingStatus request', () => {
      const request = parseTradingStatusRequest(argv({
        'instrument-id': 'BBG00QPYJ5H0'
      }));

      assert.deepEqual(request, {
        figi: '',
        instrumentId: 'BBG00QPYJ5H0'
      });
    });
  });

  describe('parseTradingStatusFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseTradingStatusFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseTradingStatusFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createTradingStatusCommand', () => {
    test('calls getTradingStatus and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetTradingStatusRequest | undefined;
      let closeCalls = 0;
      const command = createTradingStatusCommand((options) => {
        receivedOptions = options;

        return {
          marketdata: {
            async getTradingStatus(request) {
              receivedRequest = request;

              return response();
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
        format: 'json'
      }));

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        figi: '',
        instrumentId: 'BBG00QPYJ5H0'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).tradingStatus, 'SECURITY_TRADING_STATUS_NORMAL_TRADING');
    });

    test('closes sdk when getTradingStatus rejects', async () => {
      let closeCalls = 0;
      const command = createTradingStatusCommand(() => ({
        marketdata: {
          async getTradingStatus() {
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
          'instrument-id': 'BBG00QPYJ5H0'
        })),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
