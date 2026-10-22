import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { MoneyValue } from '../../../generated/common';
import type { PositionsRequest, PositionsResponse } from '../../../generated/operations';
import { createPositionsCommand } from './cli';

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function positionsResponse(
  overrides: Partial<PositionsResponse> = {}
): PositionsResponse {
  return {
    money: [money(100, 0)],
    blocked: [],
    securities: [],
    limitsLoadingInProgress: false,
    futures: [],
    options: [],
    ...overrides
  } as PositionsResponse;
}

describe('positions command', () => {
  describe('createPositionsCommand', () => {
    test('calls getPositions and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
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
          'operation',
          'positions',
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
      assert.deepEqual(receivedRequest, { accountId: 'account-id' });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).money[0].amount, '100');
    });
  });
});
