import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../command';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { MoneyValue } from '../../../generated/common';
import type {
  WithdrawLimitsRequest,
  WithdrawLimitsResponse
} from '../../../generated/operations';
import type { CommandRawOptions } from '../../command-options';
import {
  createWithdrawLimitsCommand,
  parseWithdrawLimitsFormat,
  createWithdrawLimitsRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function withdrawLimitsResponse(
  overrides: Partial<WithdrawLimitsResponse> = {}
): WithdrawLimitsResponse {
  return {
    money: [money(100, 0)],
    blocked: [money(10, 0)],
    blockedGuarantee: [money(1, 500000000)],
    ...overrides
  };
}

describe('withdraw-limits command', () => {
  describe('createWithdrawLimitsRequest', () => {
    test('returns generated getWithdrawLimits request', () => {
      const request = createWithdrawLimitsRequest({
        'account-id': 'account-id'
      });

      assert.deepEqual(request, {
        accountId: 'account-id'
      });
    });
  });

  describe('parseWithdrawLimitsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseWithdrawLimitsFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseWithdrawLimitsFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createWithdrawLimitsCommand', () => {
    test('calls getWithdrawLimits and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: WithdrawLimitsRequest | undefined;
      let closeCalls = 0;
      const command = createWithdrawLimitsCommand((options) => {
        receivedOptions = options;

        return {
          operations: {
            async getWithdrawLimits(request) {
              receivedRequest = request;

              return withdrawLimitsResponse();
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
          'operations',
          'get-withdraw-limits',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=account-id',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        accountId: 'account-id'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).money[0].amount, '100');
    });

    test('closes sdk when getWithdrawLimits rejects', async () => {
      let closeCalls = 0;
      const command = createWithdrawLimitsCommand(() => ({
        operations: {
          async getWithdrawLimits() {
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
            'operations',
            'get-withdraw-limits',
            '--token=token',
            '--endpoint=localhost:50051',
            '--account-id=account-id'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
