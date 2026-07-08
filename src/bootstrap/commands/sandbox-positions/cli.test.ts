import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { MoneyValue } from '../../../generated/common';
import type { PositionsRequest, PositionsResponse } from '../../../generated/operations';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createSandboxPositionsCommand,
  createSandboxPositionsRequest,
  parseSandboxPositionsFormat
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

function positionsResponse(overrides: Partial<PositionsResponse> = {}): PositionsResponse {
  return {
    money: [money(100, 0)],
    blocked: [],
    securities: [],
    limitsLoadingInProgress: false,
    futures: [],
    options: [],
    ...overrides
  };
}

describe('sandbox-positions command', () => {
  describe('createSandboxPositionsRequest', () => {
    test('returns generated getSandboxPositions request', () => {
      const request = createSandboxPositionsRequest({
        'account-id': 'sandbox-account-id'
      });

      assert.equal(request.accountId, 'sandbox-account-id');
    });
  });

  describe('parseSandboxPositionsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSandboxPositionsFormat(rawOptions()), 'table');
    });
  });

  describe('createSandboxPositionsCommand', () => {
    test('calls getSandboxPositions and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: PositionsRequest | undefined;
      let closeCalls = 0;
      const command = createSandboxPositionsCommand((options) => {
        receivedOptions = options;

        return {
          sandbox: {
            async getSandboxPositions(request) {
              receivedRequest = request;

              return positionsResponse();
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
          'position',
          'list',
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
      assert.equal(receivedRequest?.accountId, 'sandbox-account-id');
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).money[0].amount, '100');
    });

    test('closes sdk when getSandboxPositions rejects', async () => {
      let closeCalls = 0;
      const command = createSandboxPositionsCommand(() => ({
        sandbox: {
          async getSandboxPositions() {
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
            'position',
            'list',
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
