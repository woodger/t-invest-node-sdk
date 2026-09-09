import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { MoneyValue } from '../../../generated/common';
import type {
  WithdrawLimitsRequest,
  WithdrawLimitsResponse
} from '../../../generated/operations';
import { createWithdrawLimitsCommand } from './cli';

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
  } as WithdrawLimitsResponse;
}

describe('withdraw-limits command', () => {
  describe('createWithdrawLimitsCommand', () => {
    test('calls getWithdrawLimits and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
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
          'operation',
          'withdraw-limits',
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
            'operation',
            'withdraw-limits',
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
