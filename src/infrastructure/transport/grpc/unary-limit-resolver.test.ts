import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import { UnaryLimitResolver } from './unary-limit-resolver';

const ordersPath =
  '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders';
const minuteWindowMs = 60_000;
const ordersServiceRequestsPerMinute = 100;
const getOrdersRequestsPerMinute = 200;
const reportsRequestsPerMinute = 5;

describe('UnaryLimitResolver', () => {
  test(
    'resolves a service fallback from the final qualified service segment',
    () => {
      const resolver = new UnaryLimitResolver({
        OrdersService: perMinute(ordersServiceRequestsPerMinute)
      });
      const getOrdersQuota = resolveRequiredQuota(resolver, ordersPath);
      const getOrderStateQuota = resolveRequiredQuota(
        resolver,
        '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState'
      );

      assert.equal(
        getOrdersQuota.maxRequests,
        ordersServiceRequestsPerMinute
      );
      assert.equal(
        getOrderStateQuota.maxRequests,
        ordersServiceRequestsPerMinute
      );
      assert.equal(getOrdersQuota.bucket, getOrderStateQuota.bucket);
    }
  );

  test('prefers an exact method rule regardless of declaration order', () => {
    const methodFirst = new UnaryLimitResolver({
      [ordersPath]: perMinute(getOrdersRequestsPerMinute),
      OrdersService: perMinute(ordersServiceRequestsPerMinute)
    });
    const fallbackFirst = new UnaryLimitResolver({
      OrdersService: perMinute(ordersServiceRequestsPerMinute),
      [ordersPath]: perMinute(getOrdersRequestsPerMinute)
    });
    const methodFirstQuota = resolveRequiredQuota(methodFirst, ordersPath);
    const fallbackFirstQuota = resolveRequiredQuota(fallbackFirst, ordersPath);
    const serviceFallbackQuota = resolveRequiredQuota(
      methodFirst,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState'
    );

    assert.equal(methodFirstQuota.maxRequests, getOrdersRequestsPerMinute);
    assert.equal(fallbackFirstQuota.maxRequests, getOrdersRequestsPerMinute);
    assert.equal(methodFirstQuota.bucket, fallbackFirstQuota.bucket);
    assert.notEqual(methodFirstQuota.bucket, serviceFallbackQuota.bucket);
  });

  test('does not match a service name inside a longer service name', () => {
    const resolver = new UnaryLimitResolver({
      OrdersService: perMinute(ordersServiceRequestsPerMinute)
    });

    assert.equal(
      resolver.resolve(
        '/tinkoff.public.invest.api.contract.v1.StopOrdersService/GetStopOrders'
      ),
      undefined
    );
  });

  test('does not resolve inherited limit rules', () => {
    const inheritedLimits = Object.create({
      [ordersPath]: perMinute(getOrdersRequestsPerMinute),
      OrdersService: perMinute(ordersServiceRequestsPerMinute)
    }) as Record<string, ReturnType<typeof perMinute>>;
    const resolver = new UnaryLimitResolver(inheritedLimits);

    assert.equal(resolver.resolve(ordersPath), undefined);
  });

  test('uses a configured quota bucket for a matched rule', () => {
    const brokerReportPath =
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
    const dividendsReportPath =
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer';
    const resolver = new UnaryLimitResolver({
      [brokerReportPath]: perMinute(reportsRequestsPerMinute),
      [dividendsReportPath]: perMinute(reportsRequestsPerMinute)
    }, {
      [brokerReportPath]: 'reports',
      [dividendsReportPath]: 'reports'
    });
    const brokerReportQuota = resolveRequiredQuota(resolver, brokerReportPath);
    const dividendsReportQuota = resolveRequiredQuota(
      resolver,
      dividendsReportPath
    );

    assert.equal(brokerReportQuota.maxRequests, reportsRequestsPerMinute);
    assert.equal(dividendsReportQuota.maxRequests, reportsRequestsPerMinute);
    assert.equal(brokerReportQuota.bucket, dividendsReportQuota.bucket);
  });

  test('returns undefined for an unknown path', () => {
    const resolver = new UnaryLimitResolver({
      OrdersService: perMinute(ordersServiceRequestsPerMinute)
    });

    assert.equal(
      resolver.resolve(
        '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts'
      ),
      undefined
    );
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
    windowMs: minuteWindowMs
  };
}
