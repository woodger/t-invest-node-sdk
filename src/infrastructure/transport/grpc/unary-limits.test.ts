import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  defineUnaryLimitBuckets,
  defineUnaryLimits
} from './unary-limits';

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

describe('defineUnaryLimitBuckets', () => {
  test('maps methods from one quota group to a shared bucket', () => {
    const buckets = defineUnaryLimitBuckets({
      reports: {
        service: 'OperationsService',
        methods: [
          'GetBrokerReport',
          'GetDividendsForeignIssuer'
        ]
      }
    });

    assert.deepEqual(buckets, {
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport': 'reports',
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer': 'reports'
    });
  });

  test('rejects a method assigned to more than one quota group', () => {
    assert.throws(
      () => defineUnaryLimitBuckets({
        first: {
          service: 'OperationsService',
          methods: ['GetBrokerReport']
        },
        second: {
          service: 'OperationsService',
          methods: ['GetBrokerReport']
        }
      }),
      /assigned to both first and second/
    );
  });
});
