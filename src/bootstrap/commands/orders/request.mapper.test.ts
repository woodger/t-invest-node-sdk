import assert from 'node:assert';
import { describe, test } from 'node:test';
import { createOrdersRequest } from './request.mapper';

describe('createOrdersRequest', () => {
  test('возвращает generated GetOrdersRequest', () => {
    assert.deepEqual(createOrdersRequest({
      'account-id': 'account-id'
    }), {
      accountId: 'account-id'
    });
  });
});
