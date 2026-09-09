import assert from 'node:assert';
import { describe, test } from 'node:test';
import { OperationState } from '../../../generated/operations';
import { createOperationsRequest } from './request.mapper';

describe('createOperationsRequest', () => {
  test('преобразует options в generated OperationsRequest', () => {
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

  test('преобразует остальные состояния операций', () => {
    const cases = [
      ['unspecified', OperationState.OPERATION_STATE_UNSPECIFIED],
      ['canceled', OperationState.OPERATION_STATE_CANCELED],
      ['progress', OperationState.OPERATION_STATE_PROGRESS]
    ] as const;

    for (const [state, expectedState] of cases) {
      const request = createOperationsRequest({
        'account-id': 'account-id',
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-06-19T00:00:00.000Z',
        state
      });

      assert.equal(request.state, expectedState);
    }
  });

  test('отклоняет обратный диапазон дат', () => {
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
