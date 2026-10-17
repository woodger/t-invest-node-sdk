import { strict as assert } from 'node:assert';
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

const minuteWindowMs = 60_000;
const secondWindowMs = 1_000;
const instrumentsDefaultRequestsPerMinute = 200;
const instrumentsListRequestsPerMinute = 15;
const marketDataRequestsPerMinute = 600;
const operationsDefaultRequestsPerMinute = 200;
const operationsReportRequestsPerMinute = 5;
const ordersDefaultRequestsPerMinute = 100;
const ordersGetOrdersRequestsPerMinute = 200;
const ordersPostOrderRequestsPerSecond = 15;
const ordersPostOrderAsyncRequestsPerMinute = 600;
const ordersCancelOrderRequestsPerMinute = 300;
const ordersReplaceOrderRequestsPerMinute = 300;
const sandboxRequestsPerMinute = 200;
const signalsRequestsPerMinute = 100;
const stopOrdersDefaultRequestsPerMinute = 50;
const stopOrdersGetRequestsPerMinute = 60;
const usersRequestsPerMinute = 100;
const overriddenUsersRequestsPerMinute = 25;
const overridePostOrderRequestsPerMinute = 300;
const overrideGetOrderBookRequestsPerMinute = 300;
const customReportRequestsPerMinute = 10;

describe('defaultConfig', () => {
  test('applies current service-level unary limits', () => {
    const resolver = createDefaultUnaryLimitResolver();
    const expectedLimits = {
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetInstrumentBy':
        instrumentsDefaultRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles':
        marketDataRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio':
        operationsDefaultRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState':
        ordersDefaultRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.SandboxService/GetSandboxAccounts':
        sandboxRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.SignalService/GetSignals':
        signalsRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.StopOrdersService/PostStopOrder':
        stopOrdersDefaultRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts':
        usersRequestsPerMinute
    };

    for (const [path, limit] of Object.entries(expectedLimits)) {
      assert.equal(resolver.resolve(path)?.maxRequests, limit);
    }
  });

  test('applies lower method-specific limits before service fallbacks', () => {
    const resolver = createDefaultUnaryLimitResolver();
    const expectedLimits = {
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Bonds':
        instrumentsListRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Shares':
        instrumentsListRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Options':
        instrumentsListRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Futures':
        instrumentsListRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/Etfs':
        instrumentsListRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetAssets':
        instrumentsListRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport':
        operationsReportRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer':
        operationsReportRequestsPerMinute
    };

    for (const [path, limit] of Object.entries(expectedLimits)) {
      assert.equal(resolver.resolve(path)?.maxRequests, limit);
    }
  });

  test('applies higher method-specific limits before service fallbacks', () => {
    const resolver = createDefaultUnaryLimitResolver();
    const expectedLimits = {
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders':
        ordersGetOrdersRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder':
        ordersPostOrderRequestsPerSecond,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrderAsync':
        ordersPostOrderAsyncRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/CancelOrder':
        ordersCancelOrderRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/ReplaceOrder':
        ordersReplaceOrderRequestsPerMinute,
      '/tinkoff.public.invest.api.contract.v1.StopOrdersService/GetStopOrders':
        stopOrdersGetRequestsPerMinute
    };

    for (const [path, limit] of Object.entries(expectedLimits)) {
      assert.equal(resolver.resolve(path)?.maxRequests, limit);
    }

    assert.equal(
      resolver.resolve(
        '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder'
      )?.windowMs,
      secondWindowMs
    );
  });
});

describe('resolveSdkInstanceOptions', () => {
  test(
    'keeps the TLS package default for an explicitly undefined option',
    () => {
      const unsafeOptions = {
        token: 'token',
        endpoint: 'localhost:50051',
        useSsl: undefined
      } as unknown as TInvestOptions;
      const options = resolveSdkInstanceOptions(unsafeOptions);

      assert.equal(options.useSsl, true);
    }
  );

  test('rejects an unsupported token without exposing its value', () => {
    const token = 'секретный-token';

    assert.throws(
      () =>
        resolveSdkInstanceOptions({
          token,
          endpoint: 'localhost:50051'
        }),
      (error: unknown) =>
        isSdkError(error, SdkErrorCode.InvalidArgument)
        && error.source === 'sdk'
        && error.cause === undefined
        && !error.message.includes(token)
    );
  });

  test('rejects an app name unsupported by gRPC metadata', () => {
    assert.throws(
      () =>
        resolveSdkInstanceOptions({
          token: 'token',
          endpoint: 'localhost:50051',
          appName: 'приложение'
        }),
      (error: unknown) =>
        isSdkError(error, SdkErrorCode.InvalidArgument)
        && error.source === 'sdk'
        && error.message.includes('TInvestOptions.appName')
    );
  });

  test('rejects a limiter without a callable acquire capability', () => {
    assert.throws(
      () =>
        resolveSdkInstanceOptions({
          token: 'token',
          endpoint: 'localhost:50051',
          unaryLimiter: {} as never
        }),
      (error: unknown) =>
        isSdkError(error, SdkErrorCode.InvalidArgument)
        && error.source === 'sdk'
        && error.message.includes('TInvestOptions.unaryLimiter')
    );
  });

  test('rejects the removed trackLimits option instead of ignoring it', () => {
    assert.throws(
      () =>
        resolveSdkInstanceOptions({
          token: 'token',
          endpoint: 'localhost:50051',
          trackLimits: true
        } as never),
      (error: unknown) =>
        isSdkError(error, SdkErrorCode.InvalidArgument)
        && error.source === 'sdk'
        && error.message.includes('configure unaryLimiter explicitly')
    );
  });
});

describe('resolveUnaryLimitConfig', () => {
  test('merges per-instance overrides over package defaults', () => {
    const { limits } = resolveUnaryLimitConfig({
      UsersService: perMinute(overriddenUsersRequestsPerMinute)
    });

    assert.deepEqual(
      limits['UsersService'],
      perMinute(overriddenUsersRequestsPerMinute)
    );
    assert.deepEqual(
      limits['MarketDataService'],
      perMinute(marketDataRequestsPerMinute)
    );
  });

  test('merges method overrides produced from nested definitions', () => {
    const overrides = defineUnaryLimits({
      OrdersService: {
        methods: {
          PostOrder: perMinute(overridePostOrderRequestsPerMinute)
        }
      }
    });
    const config = resolveUnaryLimitConfig(overrides);
    const resolver = new UnaryLimitResolver(config.limits, config.buckets);

    assert.equal(
      resolver.resolve(
        '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder'
      )?.maxRequests,
      overridePostOrderRequestsPerMinute
    );
    assert.equal(
      resolver.resolve(
        '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState'
      )?.maxRequests,
      ordersDefaultRequestsPerMinute
    );
  });

  test(
    'accepts an override for a generated method without a package-specific rule',
    () => {
      const overrides = defineUnaryLimits({
        MarketDataService: {
          methods: {
            GetOrderBook: perMinute(overrideGetOrderBookRequestsPerMinute)
          }
        }
      });
      const config = resolveUnaryLimitConfig(overrides);
      const resolver = new UnaryLimitResolver(config.limits, config.buckets);

      assert.equal(
        resolver.resolve(
          '/tinkoff.public.invest.api.contract.v1.MarketDataService/GetOrderBook'
        )?.maxRequests,
        overrideGetOrderBookRequestsPerMinute
      );
    }
  );

  test('returns an isolated snapshot for each resolution', () => {
    const first = resolveUnaryLimitConfig();
    const second = resolveUnaryLimitConfig();

    const firstUsersLimit = first.limits['UsersService'];

    if (firstUsersLimit === undefined) {
      assert.fail('Expected UsersService limit');
    }

    (firstUsersLimit as { maxRequests: number }).maxRequests =
      overriddenUsersRequestsPerMinute;

    assert.deepEqual(
      second.limits['UsersService'],
      perMinute(usersRequestsPerMinute)
    );
    assert.deepEqual(
      defaultConfig.unaryLimits['UsersService'],
      perMinute(usersRequestsPerMinute)
    );
  });

  test(
    'rejects invalid per-instance request counts after merging overrides',
    () => {
      for (const limit of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
        assert.throws(
          () =>
            resolveUnaryLimitConfig({
              UsersService: {
                maxRequests: limit,
                windowMs: minuteWindowMs
              }
            }),
          (error: unknown) =>
            isSdkError(error, SdkErrorCode.InvalidArgument)
            && error.source === 'sdk'
            && error.cause instanceof Error
            && error.message
              === 'Unary limit UsersService.maxRequests must be a finite positive number'
        );
      }
    }
  );

  test('rejects an invalid per-instance quota window', () => {
    assert.throws(
      () =>
        resolveUnaryLimitConfig({
          UsersService: {
            maxRequests: usersRequestsPerMinute,
            windowMs: 0
          }
        }),
      (error: unknown) =>
        isSdkError(error, SdkErrorCode.InvalidArgument)
        && error.source === 'sdk'
        && error.message
          === 'Unary limit UsersService.windowMs must be a finite positive number'
    );
  });

  test('rejects unknown per-instance limit rules', () => {
    assert.throws(
      () =>
        resolveUnaryLimitConfig({
          MarketDataServce: perMinute(1)
        }),
      (error: unknown) =>
        isSdkError(error, SdkErrorCode.InvalidArgument)
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
        (error: unknown) =>
          isSdkError(error, SdkErrorCode.InvalidArgument)
          && error.source === 'sdk'
          && error.message
            === 'Unary limit UsersService.maxRequests must be a finite positive number'
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

  test(
    'does not couple a changed method override to its former quota group',
    () => {
      const brokerReportPath =
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
      const dividendsReportPath =
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer';
      const overrides = defineUnaryLimits({
        OperationsService: {
          methods: {
            GetBrokerReport: perMinute(customReportRequestsPerMinute)
          }
        }
      });
      const config = resolveUnaryLimitConfig(overrides);
      const resolver = new UnaryLimitResolver(config.limits, config.buckets);
      const brokerReport = resolveRequiredQuota(resolver, brokerReportPath);
      const dividendsReport = resolveRequiredQuota(
        resolver,
        dividendsReportPath
      );

      assert.notEqual(brokerReport.bucket, dividendsReport.bucket);
    }
  );

  test(
    'keeps a method grouped when an override repeats its package limit',
    () => {
      const overrides = defineUnaryLimits({
        OperationsService: {
          methods: {
            GetBrokerReport: perMinute(operationsReportRequestsPerMinute)
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
    }
  );

  test('keeps a quota group when all of its methods get one new limit', () => {
    const overrides = defineUnaryLimits({
      OperationsService: {
        methods: {
          GetBrokerReport: perMinute(customReportRequestsPerMinute),
          GetDividendsForeignIssuer: perMinute(customReportRequestsPerMinute)
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

    assert.equal(brokerReport.maxRequests, customReportRequestsPerMinute);
    assert.equal(dividendsReport.maxRequests, customReportRequestsPerMinute);
    assert.equal(brokerReport.bucket, dividendsReport.bucket);
  });

  test('detaches a grouped default changed through public config', () => {
    const path =
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
    const previousLimit = defaultConfig.unaryLimits[path];

    try {
      defaultConfig.unaryLimits[path] = perMinute(
        customReportRequestsPerMinute
      );

      const { limits, buckets } = resolveUnaryLimitConfig();
      const resolver = new UnaryLimitResolver(limits, buckets);
      const quota = resolveRequiredQuota(resolver, path);
      const groupedQuota = resolveRequiredQuota(
        resolver,
        '/tinkoff.public.invest.api.contract.v1.OperationsService/GetDividendsForeignIssuer'
      );

      assert.equal(quota.maxRequests, customReportRequestsPerMinute);
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
    const path =
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
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

      assert.equal(quota.maxRequests, operationsDefaultRequestsPerMinute);
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
    const path =
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetBrokerReport';
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
    windowMs: minuteWindowMs
  };
}
