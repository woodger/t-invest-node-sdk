import assert from 'node:assert';
import { describe, test } from 'node:test';
import { createServer } from 'nice-grpc';
import type { CallOptions, ClientMiddlewareCall } from 'nice-grpc';
import { Throttle } from '../application/services/unary-throttle.service';
import { SignalServiceDefinition } from '../generated/signals';
import {
  createSdkMiddleware,
  UnaryLimitResolver
} from '../infrastructure/transport/grpc';
import { TinkoffInvestNodeSDK } from './tinkoff-invest-node-sdk';

type TestRequest = Record<string, never>;

async function* createUnaryResponseIterator<Response>(
  response: Response
): AsyncGenerator<never, Response, undefined> {
  const emptyUnaryResponses: never[] = [];

  for (const value of emptyUnaryResponses) {
    yield value;
  }

  return response;
}

function createUnaryCall(
  path: string
): ClientMiddlewareCall<TestRequest, { ok: boolean }, CallOptions> {
  return {
    requestStream: false,
    request: {},
    responseStream: false,
    method: {
      path,
      requestStream: false,
      responseStream: false,
      options: {}
    },
    next() {
      return createUnaryResponseIterator({ ok: true });
    }
  };
}

describe('createSdkMiddleware', () => {
  test('uses throttle from the current sdk instance', async () => {
    const path = '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts';
    const resolverA = new UnaryLimitResolver({ UsersService: 100 });
    const resolverB = new UnaryLimitResolver({ UsersService: 50 });
    const throttleA = new Throttle();
    const throttleB = new Throttle();

    let callsA = 0;
    let callsB = 0;

    throttleA.reduce = async (rule) => {
      callsA += 1;
      assert.deepEqual(rule, {
        bucket: 'rule:UsersService',
        limitPerMinute: 100
      });
    };

    throttleB.reduce = async (rule) => {
      callsB += 1;
      assert.deepEqual(rule, {
        bucket: 'rule:UsersService',
        limitPerMinute: 50
      });
    };

    const middlewareA = createSdkMiddleware(true, resolverA, throttleA);
    const middlewareB = createSdkMiddleware(true, resolverB, throttleB);

    await middlewareA(createUnaryCall(path), {}).next();
    await middlewareB(createUnaryCall(path), {}).next();

    assert.equal(callsA, 1);
    assert.equal(callsB, 1);
  });

  test('skips throttle when trackLimits is disabled', async () => {
    const resolver = new UnaryLimitResolver({});
    const throttle = new Throttle();

    let throttleCalls = 0;

    throttle.reduce = async () => {
      throttleCalls += 1;
    };

    const middleware = createSdkMiddleware(false, resolver, throttle);

    await middleware(
      createUnaryCall('/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts'),
      {}
    ).next();

    assert.equal(throttleCalls, 0);
  });
});

describe('TinkoffInvestNodeSDK', () => {
  test('exposes stream and signal clients', () => {
    const sdk = new TinkoffInvestNodeSDK({
      token: 'token',
      endpoint: 'localhost:50051',
      useSsl: false
    });

    try {
      assert.equal(typeof sdk.marketdataStream.marketDataStream, 'function');
      assert.equal(typeof sdk.marketdataStream.marketDataServerSideStream, 'function');
      assert.equal(typeof sdk.operationsStream.portfolioStream, 'function');
      assert.equal(typeof sdk.operationsStream.positionsStream, 'function');
      assert.equal(typeof sdk.ordersStream.tradesStream, 'function');
      assert.equal(typeof sdk.signals.getStrategies, 'function');
      assert.equal(typeof sdk.signals.getSignals, 'function');
    }
    finally {
      sdk.close();
    }
  });

  test('calls both SignalService methods through the facade', async () => {
    const server = createServer();
    let getStrategiesCalls = 0;
    let getSignalsCalls = 0;

    server.add(SignalServiceDefinition, {
      async getStrategies(request) {
        getStrategiesCalls += 1;
        assert.equal(request.strategyId, 'strategy-id');

        return { strategies: [] };
      },
      async getSignals(request) {
        getSignalsCalls += 1;
        assert.equal(request.signalId, 'signal-id');

        return {
          signals: [],
          paging: undefined
        };
      }
    });

    const port = await server.listen('127.0.0.1:0');
    const options = {
      token: 'token',
      endpoint: `127.0.0.1:${port}`,
      useSsl: false
    } as const;
    const strategiesSdk = new TinkoffInvestNodeSDK(options);
    const signalsSdk = new TinkoffInvestNodeSDK(options);

    try {
      const [strategies, signals] = await Promise.all([
        strategiesSdk.signals.getStrategies({
          strategyId: 'strategy-id'
        }),
        signalsSdk.signals.getSignals({
          signalId: 'signal-id'
        })
      ]);

      assert.deepEqual(strategies.strategies, []);
      assert.deepEqual(signals.signals, []);
      assert.equal(getStrategiesCalls, 1);
      assert.equal(getSignalsCalls, 1);
    }
    finally {
      strategiesSdk.close();
      signalsSdk.close();
      await server.shutdown();
    }
  });

  describe('#close', () => {
    test('closes the shared channel', () => {
      const sdk = new TinkoffInvestNodeSDK({
        token: 'token',
        endpoint: 'localhost:50051',
        useSsl: false
      });

      assert.doesNotThrow(() => sdk.close());
    });
  });
});
