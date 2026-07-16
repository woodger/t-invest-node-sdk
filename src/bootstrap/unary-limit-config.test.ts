import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  compileUnaryLimits,
  defineUnaryLimits
} from './unary-limit-config';

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

describe('compileUnaryLimits', () => {
  test('compiles service, method, and shared group rules together', () => {
    const compiled = compileUnaryLimits({
      OperationsService: {
        default: 200,
        methods: {
          GetPortfolio: 100
        },
        groups: {
          reports: {
            limit: 5,
            methods: [
              'GetBrokerReport',
              'GetDividendsForeignIssuer'
            ]
          }
        }
      }
    });

    assert.deepEqual(compiled.limits, {
      OperationsService: 200,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio': 100,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport': 5,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer': 5
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
          default: 200,
          methods: {
            GetBrokerReport: 10
          },
          groups: {
            reports: {
              limit: 5,
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
          default: 200,
          groups: {
            first: {
              limit: 5,
              methods: ['GetBrokerReport']
            },
            second: {
              limit: 5,
              methods: ['GetBrokerReport']
            }
          }
        }
      }),
      /OperationsService\/GetBrokerReport is declared more than once/
    );
  });

  test('rejects non-positive and non-finite limits', () => {
    assert.throws(
      () => compileUnaryLimits({
        UsersService: {
          default: 0
        }
      }),
      /UsersService must be a finite positive number/
    );
    assert.throws(
      () => compileUnaryLimits({
        OrdersService: {
          default: 100,
          methods: {
            PostOrder: Number.POSITIVE_INFINITY
          }
        }
      }),
      /OrdersService\/PostOrder must be a finite positive number/
    );
    assert.throws(
      () => compileUnaryLimits({
        OperationsService: {
          default: 200,
          groups: {
            reports: {
              limit: -1,
              methods: ['GetBrokerReport']
            }
          }
        }
      }),
      /OperationsService:reports must be a finite positive number/
    );
  });
});
