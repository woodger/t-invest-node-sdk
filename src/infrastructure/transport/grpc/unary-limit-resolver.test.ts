import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { UnaryLimitResolver } from './unary-limit-resolver';

const ordersPath =
  '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders';

describe('UnaryLimitResolver', () => {
  test('resolves a service fallback from the final qualified service segment', () => {
    const resolver = new UnaryLimitResolver({
      OrdersService: 100
    });

    assert.deepEqual(resolver.resolve(ordersPath), {
      bucket: 'rule:OrdersService',
      limitPerMinute: 100
    });
  });

  test('prefers an exact method rule regardless of declaration order', () => {
    const methodFirst = new UnaryLimitResolver({
      [ordersPath]: 200,
      OrdersService: 100
    });
    const fallbackFirst = new UnaryLimitResolver({
      OrdersService: 100,
      [ordersPath]: 200
    });
    const expected = {
      bucket: `rule:${ordersPath}`,
      limitPerMinute: 200
    };

    assert.deepEqual(methodFirst.resolve(ordersPath), expected);
    assert.deepEqual(fallbackFirst.resolve(ordersPath), expected);
  });

  test('does not match a service name inside a longer service name', () => {
    const resolver = new UnaryLimitResolver({
      OrdersService: 100
    });

    assert.equal(resolver.resolve(
      '/tinkoff.public.invest.api.contract.v1.StopOrdersService/GetStopOrders'
    ), undefined);
  });

  test('uses a configured quota bucket for a matched rule', () => {
    const brokerReportPath =
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
    const resolver = new UnaryLimitResolver({
      [brokerReportPath]: 5
    }, {
      [brokerReportPath]: 'OperationsService:reports'
    });

    assert.deepEqual(resolver.resolve(brokerReportPath), {
      bucket: 'quota:OperationsService:reports',
      limitPerMinute: 5
    });
  });

  test('returns undefined for an unknown path', () => {
    const resolver = new UnaryLimitResolver({
      OrdersService: 100
    });

    assert.equal(resolver.resolve(
      '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts'
    ), undefined);
  });
});
