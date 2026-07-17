import assert from 'node:assert';
import { describe, test } from 'node:test';
import { Throttle } from './unary-throttle.service';

describe('Throttle', () => {
  describe('#resolveLimit', () => {
    test('returns the configured limit for a matching path', () => {
      const throttle = new Throttle({
        MarketDataService: 300
      });

      assert.equal(
        throttle.resolveLimit('/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles'),
        300
      );
    });

    test('returns undefined for an unknown path', () => {
      const throttle = new Throttle({
        KnownService: 100
      });

      assert.equal(
        throttle.resolveLimit('/tinkoff.public.invest.api.contract.v1.UnknownService/Get'),
        undefined
      );
    });

    test('prefers the most specific matching key for overlapping routes', () => {
      const throttle = new Throttle({
        OrdersService: 100,
        '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders': 200
      });

      assert.equal(
        throttle.resolveLimit('/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders'),
        200
      );
    });

    test('does not depend on object key order for overlapping routes', () => {
      const throttle = new Throttle({
        '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders': 200,
        OrdersService: 100
      });

      assert.equal(
        throttle.resolveLimit('/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders'),
        200
      );
    });

    test('does not match a service name inside a longer service name', () => {
      const throttle = new Throttle({
        OrdersService: 100
      });

      assert.equal(
        throttle.resolveLimit(
          '/tinkoff.public.invest.api.contract.v1.StopOrdersService/GetStopOrders'
        ),
        undefined
      );
    });
  });

  describe('#reduce', () => {
    test('throws for unknown unary limit path', async () => {
      const throttle = new Throttle({
        KnownService: 100
      });

      await assert.rejects(
        throttle.reduce('/tinkoff.public.invest.api.contract.v1.UnknownService/Get'),
        /Unhandled unary limits/
      );
    });

    test('does not wait on the first request for a known path', async () => {
      const throttle = new Throttle({
        MarketDataService: 300
      });

      const delays = await captureThrottleDelays(async () => {
        await throttle.reduce('/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles');
      });

      assert.deepEqual(delays, []);
    });

    test('waits according to the configured limit between requests', async () => {
      const throttle = new Throttle({
        OrdersService: 100
      });

      const delays = await captureThrottleDelays(async () => {
        await throttle.reduce('/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState');
        await throttle.reduce('/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState');
      });

      assert.deepEqual(delays, [600]);
    });

    test('does not delay calls matched by another service rule', async () => {
      const throttle = new Throttle({
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport': 5,
        MarketDataService: 600
      });

      const delays = await captureThrottleDelays(async () => {
        await throttle.reduce(
          '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport'
        );
        await throttle.reduce(
          '/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles'
        );
      });

      assert.deepEqual(delays, []);
    });

    test('shares a service fallback between different methods', async () => {
      const throttle = new Throttle({
        OrdersService: 100
      });

      const delays = await captureThrottleDelays(async () => {
        await throttle.reduce('/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState');
        await throttle.reduce('/tinkoff.public.invest.api.contract.v1.OrdersService/GetMaxLots');
      });

      assert.deepEqual(delays, [600]);
    });

    test('shares a quota group between different method rules', async () => {
      const brokerReportPath =
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
      const dividendsReportPath =
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer';
      const throttle = new Throttle({
        [brokerReportPath]: 5,
        [dividendsReportPath]: 5
      }, {
        [brokerReportPath]: 'operations:reports',
        [dividendsReportPath]: 'operations:reports'
      });

      const delays = await captureThrottleDelays(async () => {
        await throttle.reduce(brokerReportPath);
        await throttle.reduce(dividendsReportPath);
      });

      assert.deepEqual(delays, [12000]);
    });

    test('keeps a method quota group independent from its service fallback', async () => {
      const brokerReportPath =
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
      const dividendsReportPath =
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer';
      const throttle = new Throttle({
        OperationsService: 200,
        [brokerReportPath]: 5,
        [dividendsReportPath]: 5
      }, {
        [brokerReportPath]: 'operations:reports',
        [dividendsReportPath]: 'operations:reports'
      });

      const delays = await captureThrottleDelays(async () => {
        await throttle.reduce(brokerReportPath);
        await throttle.reduce(
          '/tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio'
        );
      });

      assert.deepEqual(delays, []);
    });

    test('throttles repeated calls matched by the same method override', async () => {
      const path = '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder';
      const throttle = new Throttle({
        [path]: 300
      });

      const delays = await captureThrottleDelays(async () => {
        await throttle.reduce(path);
        await throttle.reduce(path);
      });

      assert.deepEqual(delays, [200]);
    });

    test('reserves sequential slots for concurrent calls in one bucket', async () => {
      const path = '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState';
      const throttle = new Throttle({
        OrdersService: 100
      });

      const delays = await captureThrottleDelays(async () => {
        await Promise.all([
          throttle.reduce(path),
          throttle.reduce(path),
          throttle.reduce(path)
        ]);
      });

      assert.deepEqual(delays, [600, 1200]);
    });

    test('reserves sequential slots for concurrent calls in one quota group', async () => {
      const firstPath = '/test.Service/First';
      const secondPath = '/test.Service/Second';
      const throttle = new Throttle({
        [firstPath]: 100,
        [secondPath]: 100
      }, {
        [firstPath]: 'test:shared',
        [secondPath]: 'test:shared'
      });

      const delays = await captureThrottleDelays(async () => {
        await Promise.all([
          throttle.reduce(firstPath),
          throttle.reduce(secondPath),
          throttle.reduce(firstPath)
        ]);
      });

      assert.deepEqual(delays, [600, 1200]);
    });

    test('rejects different limits assigned to one quota group', () => {
      const firstPath = '/test.Service/First';
      const secondPath = '/test.Service/Second';

      assert.throws(
        () => new Throttle({
          [firstPath]: 100,
          [secondPath]: 200
        }, {
          [firstPath]: 'test:shared',
          [secondPath]: 'test:shared'
        }),
        /quota group test:shared contains inconsistent limits/
      );
    });
  });
});

async function captureThrottleDelays(run: () => Promise<void>): Promise<number[]> {
  const originalDate = global.Date;
  const originalSetTimeout = global.setTimeout;
  const now = 10_000;
  const delays: number[] = [];

  class FakeDate extends Date {
    constructor(value?: string | number | Date) {
      super(value ?? now);
    }
  }

  global.Date = FakeDate as DateConstructor;
  global.setTimeout = ((callback: (...args: unknown[]) => void, delay?: number) => {
    delays.push(delay ?? 0);
    callback();

    return 0 as never;
  }) as unknown as typeof setTimeout;

  try {
    await run();

    return delays;
  }
  finally {
    global.Date = originalDate;
    global.setTimeout = originalSetTimeout;
  }
}
