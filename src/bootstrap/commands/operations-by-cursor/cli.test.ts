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
import { createOperationsByCursorCommand, createOperationsByCursorRequest } from './cli';

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

describe('operations-by-cursor command', () => {
  describe('createOperationsByCursorRequest', () => {
    test('returns generated getOperationsByCursor request', () => {
      const request = createOperationsByCursorRequest({
        'account-id': 'account-id',
        'instrument-id': 'instrument-uid',
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-06-19T00:00:00.000Z',
        cursor: 'cursor',
        limit: '1000',
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
      assert.equal(request.limit, 1000);
      assert.deepEqual(request.operationTypes, [OperationType.OPERATION_TYPE_BUY]);
      assert.equal(request.state, OperationState.OPERATION_STATE_EXECUTED);
      assert.equal(request.withoutCommissions, true);
      assert.equal(request.withoutTrades, true);
      assert.equal(request.withoutOvernights, true);
    });

    test('uses provider defaults for omitted pagination filters', () => {
      const request = createOperationsByCursorRequest({
        'account-id': 'account-id',
        state: 'unspecified',
        'without-commissions': false,
        'without-trades': false,
        'without-overnights': false
      });

      assert.equal(request.limit, 0);
      assert.deepEqual(request.operationTypes, []);
      assert.equal(request.state, OperationState.OPERATION_STATE_UNSPECIFIED);
    });

    test('maps canceled and progress states to generated values', () => {
      const cases = [
        ['canceled', OperationState.OPERATION_STATE_CANCELED],
        ['progress', OperationState.OPERATION_STATE_PROGRESS]
      ] as const;

      for (const [state, expected] of cases) {
        const request = createOperationsByCursorRequest({
          'account-id': 'account-id',
          state,
          'without-commissions': false,
          'without-trades': false,
          'without-overnights': false
        });

        assert.equal(request.state, expected);
      }
    });

    test('maps comma-separated generated operation types', () => {
      const request = createOperationsByCursorRequest({
        'account-id': 'account-id',
        'operation-type': 'OPERATION_TYPE_BUY, OPERATION_TYPE_SELL',
        state: 'unspecified',
        'without-commissions': false,
        'without-trades': false,
        'without-overnights': false
      });

      assert.deepEqual(request.operationTypes, [
        OperationType.OPERATION_TYPE_BUY,
        OperationType.OPERATION_TYPE_SELL
      ]);
    });

    test('throws for limits outside the provider range', () => {
      for (const limit of ['0', '1001']) {
        assert.throws(
          () => createOperationsByCursorRequest({
            'account-id': 'account-id',
            limit,
            state: 'unspecified',
            'without-commissions': false,
            'without-trades': false,
            'without-overnights': false
          }),
          /Expected '--limit' as integer from 1 to 1000/
        );
      }
    });

    test('throws for unknown generated operation types', () => {
      assert.throws(
        () => createOperationsByCursorRequest({
          'account-id': 'account-id',
          'operation-type': 'buy',
          state: 'unspecified',
          'without-commissions': false,
          'without-trades': false,
          'without-overnights': false
        }),
        /Expected '--operation-type' as generated OperationType name/
      );
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

  describe('createOperationsByCursorCommand', () => {
    test('calls getOperationsByCursor and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
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
          'operation',
          'page',
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
            'operation',
            'page',
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
