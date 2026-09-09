import assert from 'node:assert';
import { describe, test } from 'node:test';
import { createWithdrawLimitsRequest } from './request.mapper';

describe('createWithdrawLimitsRequest', () => {
  test('возвращает generated WithdrawLimitsRequest', () => {
    assert.deepEqual(createWithdrawLimitsRequest({
      'account-id': 'account-id'
    }), {
      accountId: 'account-id'
    });
  });
});
