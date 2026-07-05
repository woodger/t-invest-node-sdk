import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../command';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { MoneyValue } from '../../../generated/common';
import type {
  WithdrawLimitsRequest,
  WithdrawLimitsResponse
} from '../../../generated/operations';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createSandboxWithdrawLimitsCommand,
  createSandboxWithdrawLimitsRequest,
  parseSandboxWithdrawLimitsFormat
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

describe('sandbox-withdraw-limits command', () => {
  describe('createSandboxWithdrawLimitsRequest', () => {
    test('returns generated getSandboxWithdrawLimits request', () => {
      const request = createSandboxWithdrawLimitsRequest({
        'account-id': 'sandbox-account-id'
      });

      assert.deepEqual(request, {
        accountId: 'sandbox-account-id'
      });
    });
  });

  describe('parseSandboxWithdrawLimitsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSandboxWithdrawLimitsFormat(rawOptions()), 'table');
    });
  });

  describe('createSandboxWithdrawLimitsCommand', () => {
    test('calls getSandboxWithdrawLimits and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: WithdrawLimitsRequest | undefined;
      let closeCalls = 0;
      const command = createSandboxWithdrawLimitsCommand((options) => {
        receivedOptions = options;

        return {
          sandbox: {
            async getSandboxWithdrawLimits(request) {
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
          'sandbox',
          'get-sandbox-withdraw-limits',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=sandbox-account-id',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        accountId: 'sandbox-account-id'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).money[0].amount, '100');
    });

    test('closes sdk when getSandboxWithdrawLimits rejects', async () => {
      let closeCalls = 0;
      const command = createSandboxWithdrawLimitsCommand(() => ({
        sandbox: {
          async getSandboxWithdrawLimits() {
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
            'sandbox',
            'get-sandbox-withdraw-limits',
            '--token=token',
            '--endpoint=localhost:50051',
            '--account-id=sandbox-account-id'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
