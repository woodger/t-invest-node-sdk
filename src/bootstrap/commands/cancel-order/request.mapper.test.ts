import assert from 'node:assert';
import { describe, test } from 'node:test';
import { createCancelOrderRequest } from './request.mapper';

describe('createCancelOrderRequest', () => {
  test('возвращает generated CancelOrderRequest', () => {
    assert.deepEqual(createCancelOrderRequest({
      'account-id': 'account-id',
      'order-id': 'order-id'
    }), {
      accountId: 'account-id',
      orderId: 'order-id'
    });
  });
});
