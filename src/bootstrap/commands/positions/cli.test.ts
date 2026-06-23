import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { MoneyValue } from '../../../generated/common';
import type { PositionsRequest, PositionsResponse } from '../../../generated/operations';
import type { CliArgs } from '../../cli-contract';
import {
  createPositionsCommand,
  parsePositionsFormat,
  parsePositionsRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['operations get-positions'],
    ...args
  };
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
  describe('parsePositionsRequest', () => {
    test('returns generated getPositions request', () => {
      const request = parsePositionsRequest(argv({
        'account-id': 'account-id'
      }));

      assert.equal(request.accountId, 'account-id');
    });
  });

  describe('parsePositionsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parsePositionsFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parsePositionsFormat(argv({ format: 'xml' })),
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

      const output = await command(argv({
        token: 'token',
        endpoint: 'localhost:50051',
        'account-id': 'account-id',
        format: 'json'
      }));

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
        () => command(argv({
          token: 'token',
          endpoint: 'localhost:50051',
          'account-id': 'account-id'
        })),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
