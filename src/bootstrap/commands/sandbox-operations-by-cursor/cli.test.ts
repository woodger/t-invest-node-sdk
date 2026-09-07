import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import { InstrumentType, type MoneyValue } from '../../../generated/common';
import {
  OperationState,
  OperationType,
  type GetOperationsByCursorRequest,
  type GetOperationsByCursorResponse,
  type OperationItem
} from '../../../generated/operations';
import { createSandboxOperationsByCursorCommand } from './cli';

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function operationItem(overrides: Partial<OperationItem> = {}): OperationItem {
  return {
    cursor: 'item-cursor',
    brokerAccountId: 'sandbox-account-id',
    id: 'sandbox-operation-id',
    parentOperationId: 'parent-operation-id',
    name: 'Buy',
    date: new Date('2026-06-19T10:00:00.000Z'),
    type: OperationType.OPERATION_TYPE_BUY,
    description: 'Buy shares',
    state: OperationState.OPERATION_STATE_EXECUTED,
    instrumentUid: 'instrument-uid',
    figi: 'BBG00QPYJ5H0',
    instrumentType: 'share',
    instrumentKind: InstrumentType.INSTRUMENT_TYPE_SHARE,
    positionUid: 'position-uid',
    payment: money(100, 0),
    price: money(10, 500000000),
    commission: money(1, 0),
    yield: undefined,
    yieldRelative: undefined,
    accruedInt: undefined,
    quantity: 10,
    quantityRest: 0,
    quantityDone: 10,
    cancelDateTime: undefined,
    cancelReason: '',
    tradesInfo: undefined,
    assetUid: 'asset-uid',
    ...overrides
  } as OperationItem;
}

function operationsByCursorResponse(
  overrides: Partial<GetOperationsByCursorResponse> = {}
): GetOperationsByCursorResponse {
  return {
    hasNext: true,
    nextCursor: 'next-cursor',
    items: [operationItem()],
    ...overrides
  } as GetOperationsByCursorResponse;
}

describe('sandbox-operations-by-cursor command', () => {
  describe('createSandboxOperationsByCursorCommand', () => {
    test('calls getSandboxOperationsByCursor and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: GetOperationsByCursorRequest | undefined;
      let closeCalls = 0;
      const command = createSandboxOperationsByCursorCommand((options) => {
        receivedOptions = options;

        return {
          sandbox: {
            async getSandboxOperationsByCursor(request) {
              receivedRequest = request;

              return operationsByCursorResponse();
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
          'page',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=sandbox-account-id',
          '--limit=100',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(receivedRequest?.accountId, 'sandbox-account-id');
      assert.equal(receivedRequest?.limit, 100);
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).page.nextCursor, 'next-cursor');
    });

    test('closes sdk when getSandboxOperationsByCursor rejects', async () => {
      let closeCalls = 0;
      const command = createSandboxOperationsByCursorCommand(() => ({
        sandbox: {
          async getSandboxOperationsByCursor() {
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
            'page',
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
