import assert from 'node:assert';
import { describe, test } from 'node:test';
import { Throttle } from './application/services/unary-throttle.service';
import {
  defaultConfig,
  resolveUnaryThrottleConfig
} from './bootstrap/sdk-config';
import { defineUnaryLimits } from './bootstrap/unary-limit-config';
import { packageConfig } from './config';
import {
  UnaryLimitResolver
} from './infrastructure/transport/grpc/unary-limit-resolver';

describe('packageConfig', () => {
  test('defines defaults for each SDK instance', () => {
    assert.deepEqual(packageConfig.sdk, {
      useSsl: true,
      trackLimits: true
    });
  });

  test('sets the gRPC receive message limit to four MiB', () => {
    assert.equal(
      packageConfig.grpc.maxReceiveMessageLength,
      4 * 1024 * 1024
    );
  });
});

describe('defaultConfig', () => {
  test('applies current service-level unary limits', () => {
    const resolver = createDefaultUnaryLimitResolver();
    const expectedLimits = {
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetInstrumentBy': 200,
      '/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles': 600,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio': 200,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState': 100,
      '/tinkoff.public.invest.api.contract.v1.SandboxService/GetSandboxAccounts': 200,
      '/tinkoff.public.invest.api.contract.v1.SignalService/GetSignals': 100,
      '/tinkoff.public.invest.api.contract.v1.StopOrdersService/PostStopOrder': 50,
      '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts': 100
    };

    for (const [path, limit] of Object.entries(expectedLimits)) {
      assert.equal(resolver.resolve(path)?.limitPerMinute, limit);
    }
  });

  test('applies lower method-specific limits before service fallbacks', () => {
    const resolver = createDefaultUnaryLimitResolver();
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
      assert.equal(resolver.resolve(path)?.limitPerMinute, limit);
    }
  });

  test('applies higher method-specific limits before service fallbacks', () => {
    const resolver = createDefaultUnaryLimitResolver();
    const expectedLimits = {
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders': 200,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder': 900,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrderAsync': 600,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/CancelOrder': 300,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/ReplaceOrder': 300,
      '/tinkoff.public.invest.api.contract.v1.StopOrdersService/GetStopOrders': 60
    };

    for (const [path, limit] of Object.entries(expectedLimits)) {
      assert.equal(resolver.resolve(path)?.limitPerMinute, limit);
    }
  });

  test('aggregates calls in current package method quota groups', async () => {
    const { resolver, throttle } = createDefaultUnaryThrottle();

    const delays = await captureThrottleDelays(async () => {
      await throttle.reduce(resolveRequiredRule(
        resolver,
        '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Bonds'
      ));
      await throttle.reduce(resolveRequiredRule(
        resolver,
        '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Shares'
      ));
      await throttle.reduce(resolveRequiredRule(
        resolver,
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport'
      ));
      await throttle.reduce(resolveRequiredRule(
        resolver,
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer'
      ));
    });

    assert.deepEqual(delays, [4000, 12000]);
  });
});

describe('resolveUnaryThrottleConfig', () => {
  test('merges per-instance overrides over package defaults', () => {
    const { limits } = resolveUnaryThrottleConfig({
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
    const config = resolveUnaryThrottleConfig(overrides);
    const resolver = new UnaryLimitResolver(config.limits, config.buckets);

    assert.equal(
      resolver.resolve(
        '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder'
      )?.limitPerMinute,
      300
    );
    assert.equal(
      resolver.resolve(
        '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState'
      )?.limitPerMinute,
      100
    );
  });

  test('returns an isolated snapshot for each resolution', () => {
    const first = resolveUnaryThrottleConfig();
    const second = resolveUnaryThrottleConfig();

    first.limits['UsersService'] = 25;

    assert.equal(second.limits['UsersService'], 100);
    assert.equal(defaultConfig.unaryLimits['UsersService'], 100);
  });

  test('rejects invalid per-instance limits after merging overrides', () => {
    for (const limit of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(
        () => resolveUnaryThrottleConfig({ UsersService: limit }),
        /Unary limit UsersService must be a finite positive number/
      );
    }
  });

  test('rejects an invalid limit changed through public config', () => {
    const previousLimit = defaultConfig.unaryLimits['UsersService'];

    try {
      defaultConfig.unaryLimits['UsersService'] = 0;

      assert.throws(
        () => resolveUnaryThrottleConfig(),
        /Unary limit UsersService must be a finite positive number/
      );
    }
    finally {
      if (previousLimit === undefined) {
        delete defaultConfig.unaryLimits['UsersService'];
      }
      else {
        defaultConfig.unaryLimits['UsersService'] = previousLimit;
      }
    }
  });
});

describe('resolveUnaryThrottleConfig quota groups', () => {
  test('groups methods that share a package quota', () => {
    const { buckets } = resolveUnaryThrottleConfig();
    const expectedBuckets = {
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Bonds':
        'InstrumentsService:list-methods',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Shares':
        'InstrumentsService:list-methods',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Options':
        'InstrumentsService:list-methods',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Futures':
        'InstrumentsService:list-methods',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Etfs':
        'InstrumentsService:list-methods',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetAssets':
        'InstrumentsService:list-methods',
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport':
        'OperationsService:reports',
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer':
        'OperationsService:reports'
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
    const { buckets } = resolveUnaryThrottleConfig(overrides);

    assert.equal(
      buckets['/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport'],
      undefined
    );
    assert.equal(
      buckets[
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer'
      ],
      'OperationsService:reports'
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
    const config = resolveUnaryThrottleConfig(overrides);
    const resolver = new UnaryLimitResolver(config.limits, config.buckets);
    const throttle = new Throttle();

    const delays = await captureThrottleDelays(async () => {
      await throttle.reduce(resolveRequiredRule(resolver, brokerReportPath));
      await throttle.reduce(resolveRequiredRule(resolver, dividendsReportPath));
      await throttle.reduce(resolveRequiredRule(resolver, brokerReportPath));
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
    const { buckets } = resolveUnaryThrottleConfig(overrides);

    assert.equal(
      buckets['/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport'],
      'OperationsService:reports'
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
    const { buckets } = resolveUnaryThrottleConfig(overrides);

    assert.equal(
      buckets['/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport'],
      'OperationsService:reports'
    );
    assert.equal(
      buckets[
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer'
      ],
      'OperationsService:reports'
    );
  });

  test('detaches a grouped default changed through public config', () => {
    const path = '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
    const previousLimit = defaultConfig.unaryLimits[path];

    try {
      defaultConfig.unaryLimits[path] = 10;

      const { limits, buckets } = resolveUnaryThrottleConfig();
      const rule = new UnaryLimitResolver(limits, buckets).resolve(path);

      assert.equal(buckets[path], undefined);
      assert.deepEqual(rule, {
        bucket: `rule:${path}`,
        limitPerMinute: 10
      });
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

      const { limits, buckets } = resolveUnaryThrottleConfig();
      const rule = new UnaryLimitResolver(limits, buckets).resolve(path);

      assert.equal(buckets[path], undefined);
      assert.deepEqual(rule, {
        bucket: 'rule:OperationsService',
        limitPerMinute: 200
      });
    }
    finally {
      if (previousLimit !== undefined) {
        defaultConfig.unaryLimits[path] = previousLimit;
      }
    }
  });

  test('returns an isolated bucket snapshot for each resolution', () => {
    const first = resolveUnaryThrottleConfig();
    const second = resolveUnaryThrottleConfig();
    const path = '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';

    delete first.buckets[path];

    assert.equal(second.buckets[path], 'OperationsService:reports');
  });
});

function createDefaultUnaryLimitResolver(): UnaryLimitResolver {
  const config = resolveUnaryThrottleConfig();

  return new UnaryLimitResolver(config.limits, config.buckets);
}

function createDefaultUnaryThrottle(): {
  resolver: UnaryLimitResolver;
  throttle: Throttle;
} {
  return {
    resolver: createDefaultUnaryLimitResolver(),
    throttle: new Throttle()
  };
}

function resolveRequiredRule(
  resolver: UnaryLimitResolver,
  path: string
) {
  const rule = resolver.resolve(path);

  if (rule === undefined) {
    throw new Error(`Expected unary limit rule for ${path}`);
  }

  return rule;
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
