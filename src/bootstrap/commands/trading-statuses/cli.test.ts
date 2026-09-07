import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import { SecurityTradingStatus } from '../../../generated/common';
import type {
  GetTradingStatusResponse,
  GetTradingStatusesRequest,
  GetTradingStatusesResponse
} from '../../../generated/marketdata';
import { createTradingStatusesCommand, createTradingStatusesRequest } from './cli';

function tradingStatus(
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

function response(
  overrides: Partial<GetTradingStatusesResponse> = {}
): GetTradingStatusesResponse {
  return {
    tradingStatuses: [
      tradingStatus(),
      tradingStatus({
        figi: 'BBG004730N88',
        instrumentUid: 'second-instrument-uid',
        tradingStatus: SecurityTradingStatus.SECURITY_TRADING_STATUS_BREAK_IN_TRADING
      })
    ],
    ...overrides
  } as GetTradingStatusesResponse;
}

describe('trading-statuses command', () => {
  describe('createTradingStatusesRequest', () => {
    test('returns generated getTradingStatuses request', () => {
      const request = createTradingStatusesRequest({
        'instrument-id': 'BBG00QPYJ5H0,instrument-uid'
      });

      assert.deepEqual(request.instrumentId, ['BBG00QPYJ5H0', 'instrument-uid']);
    });
  });

  describe('createTradingStatusesCommand', () => {
    test('calls getTradingStatuses and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: GetTradingStatusesRequest | undefined;
      let closeCalls = 0;
      const command = createTradingStatusesCommand((options) => {
        receivedOptions = options;

        return {
          marketdata: {
            async getTradingStatuses(request) {
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
          'statuses',
          '--token=token',
          '--endpoint=localhost:50051',
          '--instrument-id=BBG00QPYJ5H0,instrument-uid',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest?.instrumentId, ['BBG00QPYJ5H0', 'instrument-uid']);
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].tradingStatus, 'SECURITY_TRADING_STATUS_NORMAL_TRADING');
    });

    test('closes sdk when getTradingStatuses rejects', async () => {
      let closeCalls = 0;
      const command = createTradingStatusesCommand(() => ({
        marketdata: {
          async getTradingStatuses() {
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
            'statuses',
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
