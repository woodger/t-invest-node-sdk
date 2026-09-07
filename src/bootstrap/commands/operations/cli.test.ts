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
import { createOperationsCommand, createOperationsRequest } from './cli';

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function operation(overrides: Partial<Operation> = {}): Operation {
  return {
    id: 'operation-id',
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

describe('operations command', () => {
  describe('createOperationsRequest', () => {
    test('returns generated getOperations request', () => {
      const request = createOperationsRequest({
        'account-id': 'account-id',
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-06-19T00:00:00.000Z',
        state: 'executed',
        'instrument-id': 'BBG00QPYJ5H0'
      });

      assert.equal(request.accountId, 'account-id');
      assert.equal(request.from?.toISOString(), '2026-06-01T00:00:00.000Z');
      assert.equal(request.to?.toISOString(), '2026-06-19T00:00:00.000Z');
      assert.equal(request.state, OperationState.OPERATION_STATE_EXECUTED);
      assert.equal(request.figi, 'BBG00QPYJ5H0');
    });

    test('maps unspecified, canceled, and progress states', () => {
      const cases = [
        ['unspecified', OperationState.OPERATION_STATE_UNSPECIFIED],
        ['canceled', OperationState.OPERATION_STATE_CANCELED],
        ['progress', OperationState.OPERATION_STATE_PROGRESS]
      ] as const;

      for (const [state, expected] of cases) {
        const request = createOperationsRequest({
          'account-id': 'account-id',
          from: '2026-06-01T00:00:00.000Z',
          to: '2026-06-19T00:00:00.000Z',
          state
        });

        assert.equal(request.state, expected);
      }
    });

    test('throws when from is later than to', () => {
      assert.throws(
        () => createOperationsRequest({
          'account-id': 'account-id',
          from: '2026-06-20T00:00:00.000Z',
          to: '2026-06-19T00:00:00.000Z',
          state: 'unspecified'
        }),
        /Expected '--from' to be earlier/
      );
    });
  });

  describe('createOperationsCommand', () => {
    test('calls getOperations and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: OperationsRequest | undefined;
      let closeCalls = 0;
      const command = createOperationsCommand((options) => {
        receivedOptions = options;

        return {
          operations: {
            async getOperations(request) {
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
          'operation',
          'list',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=account-id',
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
      assert.equal(receivedRequest?.accountId, 'account-id');
      assert.equal(receivedRequest?.state, OperationState.OPERATION_STATE_EXECUTED);
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].id, 'operation-id');
    });

    test('closes sdk when getOperations rejects', async () => {
      let closeCalls = 0;
      const command = createOperationsCommand(() => ({
        operations: {
          async getOperations() {
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
            'list',
            '--token=token',
            '--endpoint=localhost:50051',
            '--account-id=account-id',
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
