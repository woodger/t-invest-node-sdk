import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { UnaryLimitResolver } from './unary-limit-resolver';

const ordersPath =
  '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders';

describe('UnaryLimitResolver', () => {
  test('resolves a service fallback from the final qualified service segment', () => {
    const resolver = new UnaryLimitResolver({
      OrdersService: perMinute(100)
    });
    const getOrdersQuota = resolveRequiredQuota(resolver, ordersPath);
    const getOrderStateQuota = resolveRequiredQuota(
      resolver,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState'
    );

    assert.equal(getOrdersQuota.maxRequests, 100);
    assert.equal(getOrderStateQuota.maxRequests, 100);
    assert.equal(getOrdersQuota.bucket, getOrderStateQuota.bucket);
  });

  test('prefers an exact method rule regardless of declaration order', () => {
    const methodFirst = new UnaryLimitResolver({
      [ordersPath]: perMinute(200),
      OrdersService: perMinute(100)
    });
    const fallbackFirst = new UnaryLimitResolver({
      OrdersService: perMinute(100),
      [ordersPath]: perMinute(200)
    });
    const methodFirstQuota = resolveRequiredQuota(methodFirst, ordersPath);
    const fallbackFirstQuota = resolveRequiredQuota(fallbackFirst, ordersPath);
    const serviceFallbackQuota = resolveRequiredQuota(
      methodFirst,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState'
    );

    assert.equal(methodFirstQuota.maxRequests, 200);
    assert.equal(fallbackFirstQuota.maxRequests, 200);
    assert.equal(methodFirstQuota.bucket, fallbackFirstQuota.bucket);
    assert.notEqual(methodFirstQuota.bucket, serviceFallbackQuota.bucket);
  });

  test('does not match a service name inside a longer service name', () => {
    const resolver = new UnaryLimitResolver({
      OrdersService: perMinute(100)
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
      [brokerReportPath]: perMinute(5),
      [dividendsReportPath]: perMinute(5)
    }, {
      [brokerReportPath]: 'reports',
      [dividendsReportPath]: 'reports'
    });
    const brokerReportQuota = resolveRequiredQuota(resolver, brokerReportPath);
    const dividendsReportQuota = resolveRequiredQuota(resolver, dividendsReportPath);

    assert.equal(brokerReportQuota.maxRequests, 5);
    assert.equal(dividendsReportQuota.maxRequests, 5);
    assert.equal(brokerReportQuota.bucket, dividendsReportQuota.bucket);
  });

  test('returns undefined for an unknown path', () => {
    const resolver = new UnaryLimitResolver({
      OrdersService: perMinute(100)
    });

    assert.equal(resolver.resolve(
      '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts'
    ), undefined);
  });
});

function resolveRequiredQuota(
  resolver: UnaryLimitResolver,
  path: string
) {
  const quota = resolver.resolve(path);

  if (quota === undefined) {
    assert.fail(`Expected unary quota for ${path}`);
  }

  return quota;
}

function perMinute(maxRequests: number) {
  return {
    maxRequests,
    windowMs: 60_000
  };
}
