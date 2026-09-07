import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { MoneyValue } from '../../../generated/common';
import {
  OperationState,
  OperationType,
  type Operation,
  type OperationsRequest,
  type OperationsResponse
} from '../../../generated/operations';
import { createSandboxOperationsCommand } from './cli';

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function operation(overrides: Partial<Operation> = {}): Operation {
  return {
    id: 'sandbox-operation-id',
    parentOperationId: 'parent-operation-id',
    currency: 'rub',
    payment: money(100, 0),
    price: money(10, 500000000),
    state: OperationState.OPERATION_STATE_EXECUTED,
    quantity: 10,
    quantityRest: 0,
    figi: 'BBG00QPYJ5H0',
    instrumentType: 'share',
    date: new Date('2026-06-19T10:00:00.000Z'),
    type: 'Buy',
    operationType: OperationType.OPERATION_TYPE_BUY,
    trades: [],
    assetUid: 'asset-uid',
    positionUid: 'position-uid',
    instrumentUid: 'instrument-uid',
    ...overrides
  } as Operation;
}

function operationsResponse(overrides: Partial<OperationsResponse> = {}): OperationsResponse {
  return {
    operations: [operation()],
    ...overrides
  } as OperationsResponse;
}

describe('sandbox-operations command', () => {
  describe('createSandboxOperationsCommand', () => {
    test('calls getSandboxOperations and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: OperationsRequest | undefined;
      let closeCalls = 0;
      const command = createSandboxOperationsCommand((options) => {
        receivedOptions = options;

        return {
          sandbox: {
            async getSandboxOperations(request) {
              receivedRequest = request;

              return operationsResponse();
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
          'operation',
          'list',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=sandbox-account-id',
          '--from=2026-06-01T00:00:00.000Z',
          '--to=2026-06-19T00:00:00.000Z',
          '--state=executed',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(receivedRequest?.accountId, 'sandbox-account-id');
      assert.equal(receivedRequest?.state, OperationState.OPERATION_STATE_EXECUTED);
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].id, 'sandbox-operation-id');
    });

    test('closes sdk when getSandboxOperations rejects', async () => {
      let closeCalls = 0;
      const command = createSandboxOperationsCommand(() => ({
        sandbox: {
          async getSandboxOperations() {
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
            'operation',
            'list',
            '--token=token',
            '--endpoint=localhost:50051',
            '--account-id=sandbox-account-id',
            '--from=2026-06-01T00:00:00.000Z',
            '--to=2026-06-19T00:00:00.000Z'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
