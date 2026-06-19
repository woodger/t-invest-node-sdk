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

      const originalSetTimeout = global.setTimeout;
      let timeoutCalls = 0;

      global.setTimeout = ((callback: (...args: unknown[]) => void) => {
        timeoutCalls += 1;
        callback();

        return 0 as never;
      }) as unknown as typeof setTimeout;

      try {
        await throttle.reduce('/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles');

        assert.equal(timeoutCalls, 0);
      }
      finally {
        global.setTimeout = originalSetTimeout;
      }
    });

    test('waits according to the configured limit between requests', async () => {
      const throttle = new Throttle({
        OrdersService: 100
      });

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
        await throttle.reduce('/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState');
        await throttle.reduce('/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState');

        assert.deepEqual(delays, [600]);
      }
      finally {
        global.Date = originalDate;
        global.setTimeout = originalSetTimeout;
      }
    });
  });
});
