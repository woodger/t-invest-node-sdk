import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { GetUserTariffResponse } from '../../../generated/users';
import { createUserTariffCommand } from './cli';

function response(
  overrides: Partial<GetUserTariffResponse> = {}
): GetUserTariffResponse {
  return {
    unaryLimits: [
      {
        limitPerMinute: 900,
        limitPerSecond: 15,
        methods: ['OrdersService/PostOrder']
      }
    ],
    streamLimits: [
      {
        limit: 10,
        streams: ['MarketDataStreamService/MarketDataStream'],
        open: 2
      }
    ],
    ...overrides
  };
}

describe('user-tariff command', () => {
  describe('createUserTariffCommand', () => {
    test('prints both rate-limit windows from getUserTariff and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: Record<string, never> | undefined;
      let getUserTariffCalls = 0;
      let closeCalls = 0;
      const command = createUserTariffCommand((options) => {
        receivedOptions = options;

        return {
          users: {
            async getUserTariff(request) {
              receivedRequest = request;
              getUserTariffCalls += 1;

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
          'account',
          'tariff',
          '--token=token',
          '--endpoint=localhost:50051',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(getUserTariffCalls, 1);
      assert.deepEqual(receivedRequest, {});
      assert.equal(closeCalls, 1);
      assert.deepEqual(JSON.parse(output).unaryLimits, [{
        limitPerMinute: 900,
        limitPerSecond: 15,
        methods: ['OrdersService/PostOrder']
      }]);
    });
  });
});
