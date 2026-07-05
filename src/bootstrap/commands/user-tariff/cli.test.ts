import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../command';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetUserTariffResponse } from '../../../generated/users';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createUserTariffCommand,
  parseUserTariffFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function response(overrides: Partial<GetUserTariffResponse> = {}): GetUserTariffResponse {
  return {
    unaryLimits: [
      {
        limitPerMinute: 100,
        methods: ['UsersService/GetAccounts']
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
  describe('parseUserTariffFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseUserTariffFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseUserTariffFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createUserTariffCommand', () => {
    test('calls getUserTariff and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
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
          'users',
          'get-user-tariff',
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
      assert.equal(JSON.parse(output).unaryLimits[0].limitPerMinute, 100);
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
        () => commandFacade.run(
          command,
          [
            'users',
            'get-user-tariff',
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
