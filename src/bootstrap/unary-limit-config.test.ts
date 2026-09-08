import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  assertUnaryLimitConfig,
  compileUnaryLimits,
  defineUnaryLimits
} from './unary-limit-config';

const perMinute = (maxRequests: number) => ({
  maxRequests,
  windowMs: 60_000
});

describe('defineUnaryLimits', () => {
  test('converts nested definitions to the flat runtime contract', () => {
    const limits = defineUnaryLimits({
      UsersService: {
        default: perMinute(50)
      },
      OrdersService: {
        methods: {
          PostOrder: {
            maxRequests: 15,
            windowMs: 1_000
          }
        }
      }
    });

    assert.deepEqual(limits, {
      UsersService: perMinute(50),
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder': {
        maxRequests: 15,
        windowMs: 1_000
      }
    });
  });
});

describe('compileUnaryLimits', () => {
  test('compiles service, method, and shared group rules together', () => {
    const compiled = compileUnaryLimits({
      OperationsService: {
        default: perMinute(200),
        methods: {
          GetPortfolio: perMinute(100)
        },
        groups: {
          reports: {
            limit: perMinute(5),
            methods: [
              'GetBrokerReport',
              'GetDividendsForeignIssuer'
            ]
          }
        }
      }
    });

    assert.deepEqual(compiled.limits, {
      OperationsService: perMinute(200),
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio':
        perMinute(100),
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport':
        perMinute(5),
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer':
        perMinute(5)
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
      () => compileUnaryLimits({
        OperationsService: {
          default: perMinute(200),
          methods: {
            GetBrokerReport: perMinute(10)
          },
          groups: {
            reports: {
              limit: perMinute(5),
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
      () => compileUnaryLimits({
        OperationsService: {
          default: perMinute(200),
          groups: {
            first: {
              limit: perMinute(5),
              methods: ['GetBrokerReport']
            },
            second: {
              limit: perMinute(5),
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
      () => compileUnaryLimits({
        UsersService: {
          default: perMinute(0)
        }
      }),
      /UsersService\.maxRequests must be a finite positive number/
    );
    assert.throws(
      () => compileUnaryLimits({
        OrdersService: {
          default: perMinute(100),
          methods: {
            PostOrder: {
              maxRequests: 15,
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
      () => assertUnaryLimitConfig({
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
      () => assertUnaryLimitConfig({
        buckets: {
          [firstPath]: 'test:shared',
          [secondPath]: 'test:shared'
        },
        limits: {
          [firstPath]: perMinute(100),
          [secondPath]: perMinute(200)
        }
      }),
      /quota group test:shared contains inconsistent limits/
    );
  });
});
