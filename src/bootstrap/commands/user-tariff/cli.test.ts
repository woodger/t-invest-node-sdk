import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { GetUserTariffResponse } from '../../../generated/users';
import { createUserTariffCommand } from './cli';

const defaultUnaryLimitPerMinute = 100;
const defaultStreamConnectionLimit = 10;
const defaultOpenStreamCount = 2;
const postOrderUnaryLimitPerMinute = 900;
const postOrderUnaryLimitPerSecond = 15;

function response(
  overrides: Partial<GetUserTariffResponse> = {}
): GetUserTariffResponse {
  return {
    unaryLimits: [
      {
        limitPerMinute: defaultUnaryLimitPerMinute,
        methods: ['UsersService/GetAccounts']
      }
    ],
    streamLimits: [
      {
        limit: defaultStreamConnectionLimit,
        streams: ['MarketDataStreamService/MarketDataStream'],
        open: defaultOpenStreamCount
      }
    ],
    ...overrides
  };
}

describe('user-tariff command', () => {
  describe('createUserTariffCommand', () => {
    test('calls getUserTariff and closes sdk', async () => {
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
      assert.equal(
        JSON.parse(output).unaryLimits[0].limitPerMinute,
        defaultUnaryLimitPerMinute
      );
    });

    test('prints both rate-limit windows in json', async () => {
      const command = createUserTariffCommand(() => ({
        users: {
          async getUserTariff() {
            return response({
              unaryLimits: [{
                limitPerMinute: postOrderUnaryLimitPerMinute,
                limitPerSecond: postOrderUnaryLimitPerSecond,
                methods: ['OrdersService/PostOrder']
              }]
            });
          }
        },
        close: () => undefined
      }));
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

      assert.deepEqual(JSON.parse(output).unaryLimits, [{
        limitPerMinute: postOrderUnaryLimitPerMinute,
        limitPerSecond: postOrderUnaryLimitPerSecond,
        methods: ['OrdersService/PostOrder']
      }]);
    });

    test('closes sdk when getUserTariff rejects', async () => {
      let closeCalls = 0;
      const command = createUserTariffCommand(() => ({
        users: {
          async getUserTariff() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () =>
          commandFacade.run(
            command,
            [
              'account',
              'tariff',
              '--token=token',
              '--endpoint=localhost:50051'
            ],
            undefined
          ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
