import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetInfoResponse } from '../../../generated/t_tech/invest/grpc/users';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createUserInfoCommand,
  parseUserInfoFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function response(overrides: Partial<GetInfoResponse> = {}): GetInfoResponse {
  return {
    premStatus: true,
    qualStatus: false,
    qualifiedForWorkWith: ['shares', 'bonds'],
    tariff: 'premium',
    ...overrides
  } as GetInfoResponse;
}

describe('user-info command', () => {
  describe('parseUserInfoFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseUserInfoFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseUserInfoFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createUserInfoCommand', () => {
    test('calls getInfo and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: Record<string, never> | undefined;
      let getInfoCalls = 0;
      let closeCalls = 0;
      const command = createUserInfoCommand((options) => {
        receivedOptions = options;

        return {
          users: {
            async getInfo(request) {
              receivedRequest = request;
              getInfoCalls += 1;

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
          'info',
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
      assert.equal(getInfoCalls, 1);
      assert.deepEqual(receivedRequest, {});
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).tariff, 'premium');
    });

    test('closes sdk when getInfo rejects', async () => {
      let closeCalls = 0;
      const command = createUserInfoCommand(() => ({
        users: {
          async getInfo() {
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
            'account',
            'info',
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
