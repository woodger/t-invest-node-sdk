import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { InstrumentType, type MoneyValue } from '../../../generated/common';
import {
  OperationState,
  OperationType,
  type GetOperationsByCursorRequest,
  type GetOperationsByCursorResponse,
  type OperationItem
} from '../../../generated/operations';
import type { CommandRawOptions } from '../../command-options';
import {
  createSandboxOperationsByCursorCommand,
  createSandboxOperationsByCursorRequest,
  parseSandboxOperationsByCursorFormat,
  parseSandboxOperationsByCursorLimit,
  parseSandboxOperationsByCursorOperationTypes,
  parseSandboxOperationsByCursorState
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
  };
}

function operationsByCursorResponse(
  overrides: Partial<GetOperationsByCursorResponse> = {}
): GetOperationsByCursorResponse {
  return {
    hasNext: true,
    nextCursor: 'next-cursor',
    items: [operationItem()],
    ...overrides
  };
}

describe('sandbox-operations-by-cursor command', () => {
  describe('parseSandboxOperationsByCursorState', () => {
    test('returns unspecified by default', () => {
      assert.equal(
        parseSandboxOperationsByCursorState(rawOptions()),
        OperationState.OPERATION_STATE_UNSPECIFIED
      );
    });
  });

  describe('parseSandboxOperationsByCursorLimit', () => {
    test('returns zero when limit is absent to keep provider default', () => {
      assert.equal(parseSandboxOperationsByCursorLimit(rawOptions()), 0);
    });
  });

  describe('parseSandboxOperationsByCursorOperationTypes', () => {
    test('maps generated OperationType names to enum values', () => {
      assert.deepEqual(
        parseSandboxOperationsByCursorOperationTypes(rawOptions({
          'operation-type': 'OPERATION_TYPE_BUY'
        })),
        [OperationType.OPERATION_TYPE_BUY]
      );
    });
  });

  describe('createSandboxOperationsByCursorRequest', () => {
    test('returns generated getSandboxOperationsByCursor request', () => {
      const request = createSandboxOperationsByCursorRequest({
        'account-id': 'sandbox-account-id',
        'instrument-id': 'instrument-uid',
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-06-19T00:00:00.000Z',
        cursor: 'cursor',
        limit: '100',
        'operation-type': 'OPERATION_TYPE_BUY',
        state: 'executed',
        'without-commissions': true,
        'without-trades': true,
        'without-overnights': true
      });

      assert.equal(request.accountId, 'sandbox-account-id');
      assert.equal(request.instrumentId, 'instrument-uid');
      assert.equal(request.from?.toISOString(), '2026-06-01T00:00:00.000Z');
      assert.equal(request.to?.toISOString(), '2026-06-19T00:00:00.000Z');
      assert.equal(request.cursor, 'cursor');
      assert.equal(request.limit, 100);
      assert.deepEqual(request.operationTypes, [OperationType.OPERATION_TYPE_BUY]);
      assert.equal(request.state, OperationState.OPERATION_STATE_EXECUTED);
      assert.equal(request.withoutCommissions, true);
      assert.equal(request.withoutTrades, true);
      assert.equal(request.withoutOvernights, true);
    });
  });

  describe('parseSandboxOperationsByCursorFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSandboxOperationsByCursorFormat(rawOptions()), 'table');
    });
  });

  describe('createSandboxOperationsByCursorCommand', () => {
    test('calls getSandboxOperationsByCursor and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
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

      const output = await runCommand(
        command,
        [
          'sandbox',
          'get-sandbox-operations-by-cursor',
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
        () => runCommand(
          command,
          [
            'sandbox',
            'get-sandbox-operations-by-cursor',
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
