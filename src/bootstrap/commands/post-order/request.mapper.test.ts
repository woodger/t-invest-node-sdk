import assert from 'node:assert';
import { describe, test } from 'node:test';
import { PriceType } from '../../../generated/common';
import {
  OrderDirection,
  OrderType,
  TimeInForceType
} from '../../../generated/orders';
import { createPostOrderRequest } from './request.mapper';

describe('createPostOrderRequest', () => {
  test('возвращает generated PostOrderRequest', () => {
    assert.deepEqual(createPostOrderRequest({
      'account-id': 'account-id',
      'instrument-id': 'instrument-id',
      quantity: 10,
      price: '100.25',
      direction: 'buy',
      'order-type': 'limit',
      'order-id': 'idempotency-key'
    }), {
      figi: undefined,
      quantity: 10,
      price: {
        units: 100,
        nano: 250_000_000
      },
      direction: OrderDirection.ORDER_DIRECTION_BUY,
      accountId: 'account-id',
      orderType: OrderType.ORDER_TYPE_LIMIT,
      orderId: 'idempotency-key',
      instrumentId: 'instrument-id',
      timeInForce: TimeInForceType.TIME_IN_FORCE_UNSPECIFIED,
      priceType: PriceType.PRICE_TYPE_UNSPECIFIED,
      confirmMarginTrade: false
    });
  });
});
