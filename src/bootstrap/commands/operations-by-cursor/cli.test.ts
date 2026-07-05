import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../command';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { InstrumentType, type MoneyValue } from '../../../generated/common';
import {
  OperationState,
  OperationType,
  type GetOperationsByCursorRequest,
  type GetOperationsByCursorResponse,
  type OperationItem
} from '../../../generated/operations';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createOperationsByCursorCommand,
  parseOperationsByCursorFormat,
  parseOperationsByCursorLimit,
  parseOperationsByCursorOperationTypes,
  createOperationsByCursorRequest,
  parseOperationsByCursorState
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
    brokerAccountId: 'account-id',
    id: 'operation-id',
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

describe('operations-by-cursor command', () => {
  describe('parseOperationsByCursorState', () => {
    test('returns unspecified by default', () => {
      assert.equal(
        parseOperationsByCursorState(rawOptions()),
        OperationState.OPERATION_STATE_UNSPECIFIED
      );
    });

    test('maps public state names to generated enum values', () => {
      assert.equal(
        parseOperationsByCursorState(rawOptions({ state: 'executed' })),
        OperationState.OPERATION_STATE_EXECUTED
      );
      assert.equal(
        parseOperationsByCursorState(rawOptions({ state: 'canceled' })),
        OperationState.OPERATION_STATE_CANCELED
      );
      assert.equal(
        parseOperationsByCursorState(rawOptions({ state: 'progress' })),
        OperationState.OPERATION_STATE_PROGRESS
      );
    });
  });

  describe('parseOperationsByCursorLimit', () => {
    test('returns zero when limit is absent to keep provider default', () => {
      assert.equal(parseOperationsByCursorLimit(rawOptions()), 0);
    });

    test('returns a limit from 1 to 1000', () => {
      assert.equal(parseOperationsByCursorLimit(rawOptions({ limit: '1000' })), 1000);
    });

    test('rejects invalid limits', () => {
      assert.throws(
        () => parseOperationsByCursorLimit(rawOptions({ limit: '0' })),
        /Expected '--limit' as integer from 1 to 1000/
      );
      assert.throws(
        () => parseOperationsByCursorLimit(rawOptions({ limit: '1001' })),
        /Expected '--limit' as integer from 1 to 1000/
      );
    });
  });

  describe('parseOperationsByCursorOperationTypes', () => {
    test('returns empty list when operation-type is absent', () => {
      assert.deepEqual(parseOperationsByCursorOperationTypes(rawOptions()), []);
    });

    test('maps generated OperationType names to enum values', () => {
      assert.deepEqual(
        parseOperationsByCursorOperationTypes(rawOptions({
          'operation-type': 'OPERATION_TYPE_BUY, OPERATION_TYPE_SELL'
        })),
        [
          OperationType.OPERATION_TYPE_BUY,
          OperationType.OPERATION_TYPE_SELL
        ]
      );
    });

    test('rejects unknown operation types', () => {
      assert.throws(
        () => parseOperationsByCursorOperationTypes(rawOptions({ 'operation-type': 'buy' })),
        /Expected '--operation-type' as generated OperationType name/
      );
    });
  });

  describe('createOperationsByCursorRequest', () => {
    test('returns generated getOperationsByCursor request', () => {
      const request = createOperationsByCursorRequest({
        'account-id': 'account-id',
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

      assert.equal(request.accountId, 'account-id');
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

    test('throws when from is later than to', () => {
      assert.throws(
        () => createOperationsByCursorRequest({
          'account-id': 'account-id',
          from: '2026-06-20T00:00:00.000Z',
          to: '2026-06-19T00:00:00.000Z',
          state: 'unspecified',
          'without-commissions': false,
          'without-trades': false,
          'without-overnights': false
        }),
        /Expected '--from' to be earlier/
      );
    });
  });

  describe('parseOperationsByCursorFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseOperationsByCursorFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseOperationsByCursorFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createOperationsByCursorCommand', () => {
    test('calls getOperationsByCursor and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetOperationsByCursorRequest | undefined;
      let closeCalls = 0;
      const command = createOperationsByCursorCommand((options) => {
        receivedOptions = options;

        return {
          operations: {
            async getOperationsByCursor(request) {
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
          'operations',
          'get-operations-by-cursor',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=account-id',
          '--limit=100',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(receivedRequest?.accountId, 'account-id');
      assert.equal(receivedRequest?.limit, 100);
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).page.nextCursor, 'next-cursor');
    });

    test('closes sdk when getOperationsByCursor rejects', async () => {
      let closeCalls = 0;
      const command = createOperationsByCursorCommand(() => ({
        operations: {
          async getOperationsByCursor() {
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
            'get-operations-by-cursor',
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
