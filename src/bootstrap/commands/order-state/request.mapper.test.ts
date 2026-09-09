import assert from 'node:assert';
import { describe, test } from 'node:test';
import { PriceType } from '../../../generated/common';
import { createOrderStateRequest } from './request.mapper';

describe('createOrderStateRequest', () => {
  test('возвращает generated GetOrderStateRequest', () => {
    assert.deepEqual(createOrderStateRequest({
      'account-id': 'account-id',
      'order-id': 'order-id'
    }), {
      accountId: 'account-id',
      orderId: 'order-id',
      priceType: PriceType.PRICE_TYPE_UNSPECIFIED
    });
  });
});
