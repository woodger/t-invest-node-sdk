import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { TInvestOptions } from '../application/dto/t-invest-options';
import {
  isSdkError,
  SdkErrorCode
} from '../application/errors/sdk-error';
import {
  defaultConfig,
  resolveSdkInstanceOptions,
  resolveUnaryLimitConfig
} from './sdk-config';
import { defineUnaryLimits } from './unary-limit-config';
import {
  UnaryLimitResolver
} from '../infrastructure/transport/grpc/unary-limit-resolver';

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
      assert.equal(resolver.resolve(path)?.maxRequests, limit);
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
      assert.equal(resolver.resolve(path)?.maxRequests, limit);
    }
  });

  test('applies higher method-specific limits before service fallbacks', () => {
    const resolver = createDefaultUnaryLimitResolver();
    const expectedLimits = {
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders': 200,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder': 15,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrderAsync': 600,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/CancelOrder': 300,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/ReplaceOrder': 300,
      '/tinkoff.public.invest.api.contract.v1.StopOrdersService/GetStopOrders': 60
    };

    for (const [path, limit] of Object.entries(expectedLimits)) {
      assert.equal(resolver.resolve(path)?.maxRequests, limit);
    }

    assert.equal(
      resolver.resolve(
        '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder'
      )?.windowMs,
      1_000
    );
  });

});

describe('resolveSdkInstanceOptions', () => {
  test('keeps the TLS package default for an explicitly undefined option', () => {
    const unsafeOptions = {
      token: 'token',
      endpoint: 'localhost:50051',
      useSsl: undefined
    } as unknown as TInvestOptions;
    const options = resolveSdkInstanceOptions(unsafeOptions);

    assert.equal(options.useSsl, true);
  });

  test('rejects an unsupported token without exposing its value', () => {
    const token = 'секретный-token';

    assert.throws(
      () => resolveSdkInstanceOptions({
        token,
        endpoint: 'localhost:50051'
      }),
      (error: unknown) => isSdkError(error, SdkErrorCode.InvalidArgument)
        && error.source === 'sdk'
        && error.cause === undefined
        && !error.message.includes(token)
    );
  });

  test('rejects an app name unsupported by gRPC metadata', () => {
    assert.throws(
      () => resolveSdkInstanceOptions({
        token: 'token',
        endpoint: 'localhost:50051',
        appName: 'приложение'
      }),
      (error: unknown) => isSdkError(error, SdkErrorCode.InvalidArgument)
        && error.source === 'sdk'
        && error.message.includes('TInvestOptions.appName')
    );
  });

  test('rejects a limiter without a callable acquire capability', () => {
    assert.throws(
      () => resolveSdkInstanceOptions({
        token: 'token',
        endpoint: 'localhost:50051',
        unaryLimiter: {} as never
      }),
      (error: unknown) => isSdkError(error, SdkErrorCode.InvalidArgument)
        && error.source === 'sdk'
        && error.message.includes('TInvestOptions.unaryLimiter')
    );
  });

  test('rejects the removed trackLimits option instead of ignoring it', () => {
    assert.throws(
      () => resolveSdkInstanceOptions({
        token: 'token',
        endpoint: 'localhost:50051',
        trackLimits: true
      } as never),
      (error: unknown) => isSdkError(error, SdkErrorCode.InvalidArgument)
        && error.source === 'sdk'
        && error.message.includes('configure unaryLimiter explicitly')
    );
  });
});

describe('resolveUnaryLimitConfig', () => {
  test('merges per-instance overrides over package defaults', () => {
    const { limits } = resolveUnaryLimitConfig({
      UsersService: perMinute(25)
    });

    assert.deepEqual(limits['UsersService'], perMinute(25));
    assert.deepEqual(limits['MarketDataService'], perMinute(600));
  });

  test('merges method overrides produced from nested definitions', () => {
    const overrides = defineUnaryLimits({
      OrdersService: {
        methods: {
          PostOrder: perMinute(300)
        }
      }
    });
    const config = resolveUnaryLimitConfig(overrides);
    const resolver = new UnaryLimitResolver(config.limits, config.buckets);

    assert.equal(
      resolver.resolve(
        '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder'
      )?.maxRequests,
      300
    );
    assert.equal(
      resolver.resolve(
        '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState'
      )?.maxRequests,
      100
    );
  });

  test('accepts an override for a generated method without a package-specific rule', () => {
    const overrides = defineUnaryLimits({
      MarketDataService: {
        methods: {
          GetOrderBook: perMinute(300)
        }
      }
    });
    const config = resolveUnaryLimitConfig(overrides);
    const resolver = new UnaryLimitResolver(config.limits, config.buckets);

    assert.equal(
      resolver.resolve(
        '/tinkoff.public.invest.api.contract.v1.MarketDataService/GetOrderBook'
      )?.maxRequests,
      300
    );
  });

  test('returns an isolated snapshot for each resolution', () => {
    const first = resolveUnaryLimitConfig();
    const second = resolveUnaryLimitConfig();

    const firstUsersLimit = first.limits['UsersService'];

    if (firstUsersLimit === undefined) {
      assert.fail('Expected UsersService limit');
    }

    (firstUsersLimit as { maxRequests: number }).maxRequests = 25;

    assert.deepEqual(second.limits['UsersService'], perMinute(100));
    assert.deepEqual(defaultConfig.unaryLimits['UsersService'], perMinute(100));
  });

  test('rejects invalid per-instance request counts after merging overrides', () => {
    for (const limit of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(
        () => resolveUnaryLimitConfig({
          UsersService: {
            maxRequests: limit,
            windowMs: 60_000
          }
        }),
        (error: unknown) => isSdkError(error, SdkErrorCode.InvalidArgument)
          && error.source === 'sdk'
          && error.cause instanceof Error
          && error.message ===
            'Unary limit UsersService.maxRequests must be a finite positive number'
      );
    }
  });

  test('rejects an invalid per-instance quota window', () => {
    assert.throws(
      () => resolveUnaryLimitConfig({
        UsersService: {
          maxRequests: 100,
          windowMs: 0
        }
      }),
      (error: unknown) => isSdkError(error, SdkErrorCode.InvalidArgument)
        && error.source === 'sdk'
        && error.message ===
          'Unary limit UsersService.windowMs must be a finite positive number'
    );
  });

  test('rejects unknown per-instance limit rules', () => {
    assert.throws(
      () => resolveUnaryLimitConfig({
        MarketDataServce: perMinute(1)
      }),
      (error: unknown) => isSdkError(error, SdkErrorCode.InvalidArgument)
        && error.source === 'sdk'
        && error.message === 'Unknown unary limit rule MarketDataServce'
    );
  });

  test('rejects an invalid limit changed through public config', () => {
    const previousLimit = defaultConfig.unaryLimits['UsersService'];

    try {
      defaultConfig.unaryLimits['UsersService'] = perMinute(0);

      assert.throws(
        () => resolveUnaryLimitConfig(),
        (error: unknown) => isSdkError(error, SdkErrorCode.InvalidArgument)
          && error.source === 'sdk'
          && error.message ===
            'Unary limit UsersService.maxRequests must be a finite positive number'
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

  test('groups methods that share a package quota', () => {
    const resolver = createDefaultUnaryLimitResolver();
    const instrumentPaths = [
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Bonds',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Shares',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Options',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Futures',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Etfs',
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetAssets'
    ];
    const reportPaths = [
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport',
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer'
    ];
    const instrumentQuotas = instrumentPaths.map((path) => (
      resolveRequiredQuota(resolver, path)
    ));
    const reportQuotas = reportPaths.map((path) => (
      resolveRequiredQuota(resolver, path)
    ));
    const instrumentBucket = instrumentQuotas[0]?.bucket;
    const reportBucket = reportQuotas[0]?.bucket;

    if (instrumentBucket === undefined || reportBucket === undefined) {
      assert.fail('Expected package quota rules');
    }

    for (const quota of instrumentQuotas) {
      assert.equal(quota.bucket, instrumentBucket);
    }

    for (const quota of reportQuotas) {
      assert.equal(quota.bucket, reportBucket);
    }

    assert.notEqual(instrumentBucket, reportBucket);
  });

  test('does not couple a changed method override to its former quota group', () => {
    const brokerReportPath =
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
    const dividendsReportPath =
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer';
    const overrides = defineUnaryLimits({
      OperationsService: {
        methods: {
          GetBrokerReport: perMinute(10)
        }
      }
    });
    const config = resolveUnaryLimitConfig(overrides);
    const resolver = new UnaryLimitResolver(config.limits, config.buckets);
    const brokerReport = resolveRequiredQuota(resolver, brokerReportPath);
    const dividendsReport = resolveRequiredQuota(resolver, dividendsReportPath);

    assert.notEqual(brokerReport.bucket, dividendsReport.bucket);
  });

  test('keeps a method grouped when an override repeats its package limit', () => {
    const overrides = defineUnaryLimits({
      OperationsService: {
        methods: {
          GetBrokerReport: perMinute(5)
        }
      }
    });
    const config = resolveUnaryLimitConfig(overrides);
    const resolver = new UnaryLimitResolver(config.limits, config.buckets);
    const brokerReport = resolveRequiredQuota(
      resolver,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport'
    );
    const dividendsReport = resolveRequiredQuota(
      resolver,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer'
    );

    assert.equal(brokerReport.bucket, dividendsReport.bucket);
  });

  test('keeps a quota group when all of its methods get one new limit', () => {
    const overrides = defineUnaryLimits({
      OperationsService: {
        methods: {
          GetBrokerReport: perMinute(10),
          GetDividendsForeignIssuer: perMinute(10)
        }
      }
    });
    const config = resolveUnaryLimitConfig(overrides);
    const resolver = new UnaryLimitResolver(config.limits, config.buckets);
    const brokerReport = resolveRequiredQuota(
      resolver,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport'
    );
    const dividendsReport = resolveRequiredQuota(
      resolver,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer'
    );

    assert.equal(brokerReport.maxRequests, 10);
    assert.equal(dividendsReport.maxRequests, 10);
    assert.equal(brokerReport.bucket, dividendsReport.bucket);
  });

  test('detaches a grouped default changed through public config', () => {
    const path = '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
    const previousLimit = defaultConfig.unaryLimits[path];

    try {
      defaultConfig.unaryLimits[path] = perMinute(10);

      const { limits, buckets } = resolveUnaryLimitConfig();
      const resolver = new UnaryLimitResolver(limits, buckets);
      const quota = resolveRequiredQuota(resolver, path);
      const groupedQuota = resolveRequiredQuota(
        resolver,
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer'
      );

      assert.equal(quota.maxRequests, 10);
      assert.notEqual(quota.bucket, groupedQuota.bucket);
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

      const { limits, buckets } = resolveUnaryLimitConfig();
      const resolver = new UnaryLimitResolver(limits, buckets);
      const quota = resolveRequiredQuota(resolver, path);
      const fallbackQuota = resolveRequiredQuota(
        resolver,
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio'
      );

      assert.equal(quota.maxRequests, 200);
      assert.equal(quota.bucket, fallbackQuota.bucket);
    }
    finally {
      if (previousLimit !== undefined) {
        defaultConfig.unaryLimits[path] = previousLimit;
      }
    }
  });

  test('returns an isolated bucket snapshot for each resolution', () => {
    const first = resolveUnaryLimitConfig();
    const second = resolveUnaryLimitConfig();
    const path = '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
    const expectedBucket = second.buckets[path];

    if (expectedBucket === undefined) {
      assert.fail(`Expected quota bucket for ${path}`);
    }

    delete first.buckets[path];

    assert.equal(second.buckets[path], expectedBucket);
  });
});

function createDefaultUnaryLimitResolver(): UnaryLimitResolver {
  const config = resolveUnaryLimitConfig();

  return new UnaryLimitResolver(config.limits, config.buckets);
}

function resolveRequiredQuota(
  resolver: UnaryLimitResolver,
  path: string
) {
  const quota = resolver.resolve(path);

  if (quota === undefined) {
    throw new Error(`Expected unary quota for ${path}`);
  }

  return quota;
}

function perMinute(maxRequests: number) {
  return {
    maxRequests,
    windowMs: 60_000
  };
}
