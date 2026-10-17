import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import {
  assertUnaryLimitConfig,
  compileUnaryLimits,
  defineUnaryLimits
} from './unary-limit-config';

const minuteWindowMs = 60_000;
const secondWindowMs = 1_000;
const usersRequestsPerMinute = 50;
const operationsDefaultRequestsPerMinute = 200;
const getPortfolioRequestsPerMinute = 100;
const reportsRequestsPerMinute = 5;
const brokerReportOverrideRequestsPerMinute = 10;
const ordersDefaultRequestsPerMinute = 100;
const firstSharedBucketRequestsPerMinute = 100;
const secondSharedBucketRequestsPerMinute = 200;
const postOrderRequestsPerSecond = 15;

const perMinute = (maxRequests: number) => ({
  maxRequests,
  windowMs: minuteWindowMs
});

describe('defineUnaryLimits', () => {
  test('converts nested definitions to the flat runtime contract', () => {
    const limits = defineUnaryLimits({
      UsersService: {
        default: perMinute(usersRequestsPerMinute)
      },
      OrdersService: {
        methods: {
          PostOrder: {
            maxRequests: postOrderRequestsPerSecond,
            windowMs: secondWindowMs
          }
        }
      }
    });

    assert.deepEqual(limits, {
      UsersService: perMinute(usersRequestsPerMinute),
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder': {
        maxRequests: postOrderRequestsPerSecond,
        windowMs: secondWindowMs
      }
    });
  });
});

describe('compileUnaryLimits', () => {
  test('compiles service, method, and shared group rules together', () => {
    const compiled = compileUnaryLimits({
      OperationsService: {
        default: perMinute(operationsDefaultRequestsPerMinute),
        methods: {
          GetPortfolio: perMinute(getPortfolioRequestsPerMinute)
        },
        groups: {
          reports: {
            limit: perMinute(reportsRequestsPerMinute),
            methods: [
              'GetBrokerReport',
              'GetDividendsForeignIssuer'
            ]
          }
        }
      }
    });

    assert.deepEqual(compiled.limits, {
      OperationsService: perMinute(operationsDefaultRequestsPerMinute),
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio':
        perMinute(getPortfolioRequestsPerMinute),
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport':
        perMinute(reportsRequestsPerMinute),
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer':
        perMinute(reportsRequestsPerMinute)
    });
    assert.deepEqual(compiled.buckets, {
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport':
        'OperationsService:reports',
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer':
        'OperationsService:reports'
    });
  });

  test('rejects a method declared individually and in a quota group', () => {
    assert.throws(
      () =>
        compileUnaryLimits({
          OperationsService: {
            default: perMinute(operationsDefaultRequestsPerMinute),
            methods: {
              GetBrokerReport: perMinute(
                brokerReportOverrideRequestsPerMinute
              )
            },
            groups: {
              reports: {
                limit: perMinute(reportsRequestsPerMinute),
                methods: ['GetBrokerReport']
              }
            }
          }
        }),
      /OperationsService\/GetBrokerReport is declared more than once/
    );
  });

  test('rejects a method assigned to more than one quota group', () => {
    assert.throws(
      () =>
        compileUnaryLimits({
          OperationsService: {
            default: perMinute(operationsDefaultRequestsPerMinute),
            groups: {
              first: {
                limit: perMinute(reportsRequestsPerMinute),
                methods: ['GetBrokerReport']
              },
              second: {
                limit: perMinute(reportsRequestsPerMinute),
                methods: ['GetBrokerReport']
              }
            }
          }
        }),
      /OperationsService\/GetBrokerReport is declared more than once/
    );
  });

  test('rejects invalid request counts and windows', () => {
    assert.throws(
      () =>
        compileUnaryLimits({
          UsersService: {
            default: perMinute(0)
          }
        }),
      /UsersService\.maxRequests must be a finite positive number/
    );
    assert.throws(
      () =>
        compileUnaryLimits({
          OrdersService: {
            default: perMinute(ordersDefaultRequestsPerMinute),
            methods: {
              PostOrder: {
                maxRequests: postOrderRequestsPerSecond,
                windowMs: Number.POSITIVE_INFINITY
              }
            }
          }
        }),
      /OrdersService\/PostOrder\.windowMs must be a finite positive number/
    );
  });
});

describe('assertUnaryLimitConfig', () => {
  test('rejects a quota bucket that references an unknown rule', () => {
    assert.throws(
      () =>
        assertUnaryLimitConfig({
          buckets: {
            '/test.Service/First': 'test:shared'
          },
          limits: {}
        }),
      /quota group test:shared references unknown rule \/test\.Service\/First/
    );
  });

  test('rejects different limits assigned to one quota bucket', () => {
    const firstPath = '/test.Service/First';
    const secondPath = '/test.Service/Second';

    assert.throws(
      () =>
        assertUnaryLimitConfig({
          buckets: {
            [firstPath]: 'test:shared',
            [secondPath]: 'test:shared'
          },
          limits: {
            [firstPath]: perMinute(firstSharedBucketRequestsPerMinute),
            [secondPath]: perMinute(secondSharedBucketRequestsPerMinute)
          }
        }),
      /quota group test:shared contains inconsistent limits/
    );
  });
});
