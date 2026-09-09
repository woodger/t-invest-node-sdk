import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  OperationState,
  OperationType
} from '../../../generated/operations';
import { createOperationsByCursorRequest } from './request.mapper';

const defaultOptions = {
  'account-id': 'account-id',
  state: 'unspecified',
  'without-commissions': false,
  'without-trades': false,
  'without-overnights': false
} as const;

describe('createOperationsByCursorRequest', () => {
  test('преобразует options в generated GetOperationsByCursorRequest', () => {
    const request = createOperationsByCursorRequest({
      ...defaultOptions,
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

  test('использует provider defaults для отсутствующих фильтров', () => {
    const request = createOperationsByCursorRequest(defaultOptions);

    assert.equal(request.limit, 0);
    assert.deepEqual(request.operationTypes, []);
    assert.equal(request.state, OperationState.OPERATION_STATE_UNSPECIFIED);
  });

  test('преобразует остальные состояния операций', () => {
    const cases = [
      ['canceled', OperationState.OPERATION_STATE_CANCELED],
      ['progress', OperationState.OPERATION_STATE_PROGRESS]
    ] as const;

    for (const [state, expectedState] of cases) {
      const request = createOperationsByCursorRequest({
        ...defaultOptions,
        state
      });

      assert.equal(request.state, expectedState);
    }
  });

  test('преобразует список generated operation types', () => {
    const request = createOperationsByCursorRequest({
      ...defaultOptions,
      'operation-type': 'OPERATION_TYPE_BUY, OPERATION_TYPE_SELL'
    });

    assert.deepEqual(request.operationTypes, [
      OperationType.OPERATION_TYPE_BUY,
      OperationType.OPERATION_TYPE_SELL
    ]);
  });

  test('отклоняет limit вне provider range', () => {
    for (const limit of ['0', '1001']) {
      assert.throws(
        () => createOperationsByCursorRequest({
          ...defaultOptions,
          limit
        }),
        /Expected '--limit' as integer from 1 to 1000/
      );
    }
  });

  test('отклоняет неизвестный generated operation type', () => {
    assert.throws(
      () => createOperationsByCursorRequest({
        ...defaultOptions,
        'operation-type': 'buy'
      }),
      /Expected '--operation-type' as generated OperationType name/
    );
  });

  test('отклоняет обратный диапазон дат', () => {
    assert.throws(
      () => createOperationsByCursorRequest({
        ...defaultOptions,
        from: '2026-06-20T00:00:00.000Z',
        to: '2026-06-19T00:00:00.000Z'
      }),
      /Expected '--from' to be earlier/
    );
  });
});
