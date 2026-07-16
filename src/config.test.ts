import assert from 'node:assert';
import { describe, test } from 'node:test';
import { Throttle } from './application/services/unary-throttle.service';
import {
  defaultConfig,
  resolveUnaryLimitBuckets,
  resolveUnaryLimits
} from './config';
import { defineUnaryLimits } from './infrastructure/transport/grpc/unary-limits';

describe('defaultConfig', () => {
  test('applies current service-level unary limits', () => {
    const throttle = createDefaultThrottle();
    const expectedLimits = {
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetInstrumentBy': 200,
      '/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles': 600,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio': 200,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState': 100,
      '/tinkoff.public.invest.api.contract.v1.SandboxService/GetSandboxAccounts': 200,
      '/tinkoff.public.invest.api.contract.v1.StopOrdersService/PostStopOrder': 50,
      '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts': 100
    };

    for (const [path, limit] of Object.entries(expectedLimits)) {
      assert.equal(throttle.resolveLimit(path), limit);
    }
  });

  test('applies lower method-specific limits before service fallbacks', () => {
    const throttle = createDefaultThrottle();
    const expectedLimits = {
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Bonds': 15,
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Shares': 15,
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Options': 15,
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Futures': 15,
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Etfs': 15,
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetAssets': 15,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport': 5,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer': 5
    };

    for (const [path, limit] of Object.entries(expectedLimits)) {
      assert.equal(throttle.resolveLimit(path), limit);
    }
  });

  test('applies higher method-specific limits before service fallbacks', () => {
    const throttle = createDefaultThrottle();
    const expectedLimits = {
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders': 200,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder': 900,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrderAsync': 600,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/CancelOrder': 300,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/ReplaceOrder': 300,
      '/tinkoff.public.invest.api.contract.v1.StopOrdersService/GetStopOrders': 60
    };

    for (const [path, limit] of Object.entries(expectedLimits)) {
      assert.equal(throttle.resolveLimit(path), limit);
    }
  });

  test('aggregates calls in current package method quota groups', async () => {
    const throttle = createDefaultThrottle();

    const delays = await captureThrottleDelays(async () => {
      await throttle.reduce(
        '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Bonds'
      );
      await throttle.reduce(
        '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Shares'
      );
      await throttle.reduce(
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport'
      );
      await throttle.reduce(
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer'
      );
    });

    assert.deepEqual(delays, [4000, 12000]);
  });
});

describe('resolveUnaryLimits', () => {
  test('merges per-instance overrides over package defaults', () => {
    const limits = resolveUnaryLimits({
      UsersService: 25
    });

    assert.equal(limits['UsersService'], 25);
    assert.equal(limits['MarketDataService'], 600);
  });

  test('merges method overrides produced from nested definitions', () => {
    const overrides = defineUnaryLimits({
      OrdersService: {
        methods: {
          PostOrder: 300
        }
      }
    });
    const throttle = new Throttle(
      resolveUnaryLimits(overrides),
      resolveUnaryLimitBuckets(overrides)
    );

    assert.equal(throttle.resolveLimit(
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder'
    ), 300);
    assert.equal(throttle.resolveLimit(
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState'
    ), 100);
  });

  test('returns an isolated snapshot for each resolution', () => {
    const first = resolveUnaryLimits();
    const second = resolveUnaryLimits();

    first['UsersService'] = 25;

    assert.equal(second['UsersService'], 100);
    assert.equal(defaultConfig.unaryLimits['UsersService'], 100);
  });
});

describe('resolveUnaryLimitBuckets', () => {
  test('groups methods that share a package quota', () => {
    const buckets = resolveUnaryLimitBuckets();
    const expectedBuckets = {
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Bonds':
        'instruments:list-methods',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Shares':
        'instruments:list-methods',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Options':
        'instruments:list-methods',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Futures':
        'instruments:list-methods',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Etfs':
        'instruments:list-methods',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetAssets':
        'instruments:list-methods',
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport':
        'operations:reports',
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer':
        'operations:reports'
    };

    assert.deepEqual(buckets, expectedBuckets);
  });

  test('detaches a method whose override changes its package limit', () => {
    const overrides = defineUnaryLimits({
      OperationsService: {
        methods: {
          GetBrokerReport: 10
        }
      }
    });
    const buckets = resolveUnaryLimitBuckets(overrides);

    assert.equal(
      buckets['/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport'],
      undefined
    );
    assert.equal(
      buckets[
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer'
      ],
      'operations:reports'
    );
  });

  test('does not couple a changed method override to its former quota group', async () => {
    const brokerReportPath =
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
    const dividendsReportPath =
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer';
    const overrides = defineUnaryLimits({
      OperationsService: {
        methods: {
          GetBrokerReport: 10
        }
      }
    });
    const throttle = new Throttle(
      resolveUnaryLimits(overrides),
      resolveUnaryLimitBuckets(overrides)
    );

    const delays = await captureThrottleDelays(async () => {
      await throttle.reduce(brokerReportPath);
      await throttle.reduce(dividendsReportPath);
      await throttle.reduce(brokerReportPath);
    });

    assert.deepEqual(delays, [6000]);
  });

  test('keeps a method grouped when an override repeats its package limit', () => {
    const overrides = defineUnaryLimits({
      OperationsService: {
        methods: {
          GetBrokerReport: 5
        }
      }
    });
    const buckets = resolveUnaryLimitBuckets(overrides);

    assert.equal(
      buckets['/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport'],
      'operations:reports'
    );
  });

  test('keeps a quota group when all of its methods get one new limit', () => {
    const overrides = defineUnaryLimits({
      OperationsService: {
        methods: {
          GetBrokerReport: 10,
          GetDividendsForeignIssuer: 10
        }
      }
    });
    const buckets = resolveUnaryLimitBuckets(overrides);

    assert.equal(
      buckets['/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport'],
      'operations:reports'
    );
    assert.equal(
      buckets[
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer'
      ],
      'operations:reports'
    );
  });

  test('detaches a grouped default changed through public config', () => {
    const path = '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
    const previousLimit = defaultConfig.unaryLimits[path];

    try {
      defaultConfig.unaryLimits[path] = 10;

      const limits = resolveUnaryLimits();
      const buckets = resolveUnaryLimitBuckets();

      assert.equal(buckets[path], undefined);
      assert.doesNotThrow(() => new Throttle(limits, buckets));
    }
    finally {
      if (previousLimit === undefined) {
        delete defaultConfig.unaryLimits[path];
      }
      else {
        defaultConfig.unaryLimits[path] = previousLimit;
      }
    }
  });

  test('detaches a grouped default removed through public config', () => {
    const path = '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
    const previousLimit = defaultConfig.unaryLimits[path];

    try {
      delete defaultConfig.unaryLimits[path];

      const limits = resolveUnaryLimits();
      const buckets = resolveUnaryLimitBuckets();

      assert.equal(buckets[path], undefined);
      assert.doesNotThrow(() => new Throttle(limits, buckets));
    }
    finally {
      if (previousLimit !== undefined) {
        defaultConfig.unaryLimits[path] = previousLimit;
      }
    }
  });

  test('returns an isolated bucket snapshot for each resolution', () => {
    const first = resolveUnaryLimitBuckets();
    const second = resolveUnaryLimitBuckets();
    const path = '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';

    delete first[path];

    assert.equal(second[path], 'operations:reports');
  });
});

function createDefaultThrottle(): Throttle {
  return new Throttle(
    defaultConfig.unaryLimits,
    resolveUnaryLimitBuckets()
  );
}

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
