import assert from 'node:assert';
import { describe, test } from 'node:test';
import { PriceType } from '../../../generated/common';
import { createReplaceOrderRequest } from './request.mapper';

describe('createReplaceOrderRequest', () => {
  test('возвращает generated ReplaceOrderRequest', () => {
    assert.deepEqual(createReplaceOrderRequest({
      'account-id': 'account-id',
      'order-id': 'order-id',
      'idempotency-key': 'new-idempotency-key',
      quantity: 5,
      price: '101.5',
      'price-type': 'currency'
    }), {
      accountId: 'account-id',
      orderId: 'order-id',
      idempotencyKey: 'new-idempotency-key',
      quantity: 5,
      price: {
        units: 101,
        nano: 500_000_000
      },
      priceType: PriceType.PRICE_TYPE_CURRENCY,
      confirmMarginTrade: false
    });
  });
});
