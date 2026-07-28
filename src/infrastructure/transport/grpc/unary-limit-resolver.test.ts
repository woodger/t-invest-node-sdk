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
    const getOrdersRule = resolveRequiredRule(resolver, ordersPath);
    const getOrderStateRule = resolveRequiredRule(
      resolver,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState'
    );

    assert.equal(getOrdersRule.limitPerMinute, 100);
    assert.equal(getOrderStateRule.limitPerMinute, 100);
    assert.equal(getOrdersRule.bucket, getOrderStateRule.bucket);
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
    const methodFirstRule = resolveRequiredRule(methodFirst, ordersPath);
    const fallbackFirstRule = resolveRequiredRule(fallbackFirst, ordersPath);
    const serviceFallbackRule = resolveRequiredRule(
      methodFirst,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState'
    );

    assert.equal(methodFirstRule.limitPerMinute, 200);
    assert.equal(fallbackFirstRule.limitPerMinute, 200);
    assert.equal(methodFirstRule.bucket, fallbackFirstRule.bucket);
    assert.notEqual(methodFirstRule.bucket, serviceFallbackRule.bucket);
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
    const dividendsReportPath =
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer';
    const resolver = new UnaryLimitResolver({
      [brokerReportPath]: 5,
      [dividendsReportPath]: 5
    }, {
      [brokerReportPath]: 'reports',
      [dividendsReportPath]: 'reports'
    });
    const brokerReportRule = resolveRequiredRule(resolver, brokerReportPath);
    const dividendsReportRule = resolveRequiredRule(resolver, dividendsReportPath);

    assert.equal(brokerReportRule.limitPerMinute, 5);
    assert.equal(dividendsReportRule.limitPerMinute, 5);
    assert.equal(brokerReportRule.bucket, dividendsReportRule.bucket);
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

function resolveRequiredRule(
  resolver: UnaryLimitResolver,
  path: string
) {
  const rule = resolver.resolve(path);

  if (rule === undefined) {
    assert.fail(`Expected unary limit rule for ${path}`);
  }

  return rule;
}
