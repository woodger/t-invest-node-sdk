import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../command';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { MoneyValue } from '../../../generated/common';
import {
  OperationState,
  OperationType,
  type Operation,
  type OperationsRequest,
  type OperationsResponse
} from '../../../generated/operations';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createSandboxOperationsCommand,
  createSandboxOperationsRequest,
  parseSandboxOperationsFormat,
  parseSandboxOperationsState
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
  };
}

function operationsResponse(overrides: Partial<OperationsResponse> = {}): OperationsResponse {
  return {
    operations: [operation()],
    ...overrides
  };
}

describe('sandbox-operations command', () => {
  describe('parseSandboxOperationsState', () => {
    test('returns unspecified by default', () => {
      assert.equal(
        parseSandboxOperationsState(rawOptions()),
        OperationState.OPERATION_STATE_UNSPECIFIED
      );
    });
  });

  describe('createSandboxOperationsRequest', () => {
    test('returns generated getSandboxOperations request', () => {
      const request = createSandboxOperationsRequest({
        'account-id': 'sandbox-account-id',
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-06-19T00:00:00.000Z',
        state: 'executed',
        'instrument-id': 'BBG00QPYJ5H0'
      });

      assert.equal(request.accountId, 'sandbox-account-id');
      assert.equal(request.from?.toISOString(), '2026-06-01T00:00:00.000Z');
      assert.equal(request.to?.toISOString(), '2026-06-19T00:00:00.000Z');
      assert.equal(request.state, OperationState.OPERATION_STATE_EXECUTED);
      assert.equal(request.figi, 'BBG00QPYJ5H0');
    });
  });

  describe('parseSandboxOperationsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSandboxOperationsFormat(rawOptions()), 'table');
    });
  });

  describe('createSandboxOperationsCommand', () => {
    test('calls getSandboxOperations and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
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
          'get-sandbox-operations',
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
            'get-sandbox-operations',
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
