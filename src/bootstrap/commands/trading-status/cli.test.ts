import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import { SecurityTradingStatus } from '../../../generated/common';
import type {
  GetTradingStatusRequest,
  GetTradingStatusResponse
} from '../../../generated/marketdata';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createTradingStatusCommand,
  parseTradingStatusFormat,
  createTradingStatusRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
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
  } as GetTradingStatusResponse;
}

describe('trading-status command', () => {
  describe('createTradingStatusRequest', () => {
    test('returns generated getTradingStatus request', () => {
      const request = createTradingStatusRequest({
        'instrument-id': 'BBG00QPYJ5H0'
      });

      assert.deepEqual(request, {
        figi: '',
        instrumentId: 'BBG00QPYJ5H0'
      });
    });
  });

  describe('parseTradingStatusFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseTradingStatusFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseTradingStatusFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createTradingStatusCommand', () => {
    test('calls getTradingStatus and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
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

      const output = await commandFacade.run(
        command,
        [
          'market',
          'status',
          '--token=token',
          '--endpoint=localhost:50051',
          '--instrument-id=BBG00QPYJ5H0',
          '--format=json'
        ],
        undefined
      );

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
        () => commandFacade.run(
          command,
          [
            'market',
            'status',
            '--token=token',
            '--endpoint=localhost:50051',
            '--instrument-id=BBG00QPYJ5H0'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
