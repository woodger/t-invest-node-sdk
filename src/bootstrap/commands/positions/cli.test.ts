import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../command';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { MoneyValue } from '../../../generated/common';
import type { PositionsRequest, PositionsResponse } from '../../../generated/operations';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createPositionsCommand,
  parsePositionsFormat,
  createPositionsRequest
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

describe('positions command', () => {
  describe('createPositionsRequest', () => {
    test('returns generated getPositions request', () => {
      const request = createPositionsRequest({
        'account-id': 'account-id'
      });

      assert.equal(request.accountId, 'account-id');
    });
  });

  describe('parsePositionsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parsePositionsFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parsePositionsFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createPositionsCommand', () => {
    test('calls getPositions and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: PositionsRequest | undefined;
      let closeCalls = 0;
      const command = createPositionsCommand((options) => {
        receivedOptions = options;

        return {
          operations: {
            async getPositions(request) {
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
          'operations',
          'get-positions',
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
      assert.equal(receivedRequest?.accountId, 'account-id');
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).money[0].amount, '100');
    });

    test('closes sdk when getPositions rejects', async () => {
      let closeCalls = 0;
      const command = createPositionsCommand(() => ({
        operations: {
          async getPositions() {
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
            'get-positions',
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
