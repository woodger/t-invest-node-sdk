import assert from 'node:assert';
import { describe, test } from 'node:test';
import { defineUnaryLimits } from './unary-limits';

describe('defineUnaryLimits', () => {
  test('converts nested definitions to the flat runtime contract', () => {
    const limits = defineUnaryLimits({
      UsersService: {
        default: 50
      },
      OrdersService: {
        methods: {
          PostOrder: 300
        }
      }
    });

    assert.deepEqual(limits, {
      UsersService: 50,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder': 300
    });
  });
});
