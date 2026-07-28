import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  createServer,
  ServerError,
  Status
} from 'nice-grpc';
import {
  isSdkError,
  SdkErrorCode
} from '../application/errors/sdk-error';
import { SignalServiceDefinition } from '../generated/signals';
import { TinkoffInvestNodeSDK } from './tinkoff-invest-node-sdk';

describe('TinkoffInvestNodeSDK', () => {
  test('exposes stream clients', () => {
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

  test('maps provider failures to the public SDK error contract', async () => {
    const server = createServer();

    server.add(SignalServiceDefinition, {
      async getStrategies() {
        throw new ServerError(Status.UNAUTHENTICATED, 'invalid token');
      },
      async getSignals() {
        return {
          signals: [],
          paging: undefined
        };
      }
    });

    const port = await server.listen('127.0.0.1:0');
    const sdk = new TinkoffInvestNodeSDK({
      token: 'token',
      endpoint: `127.0.0.1:${port}`,
      useSsl: false
    });

    try {
      await assert.rejects(
        sdk.signals.getStrategies({}),
        (error: unknown) => isSdkError(error, SdkErrorCode.Unauthenticated)
          && error.source === 'grpc'
          && error.details === 'invalid token'
      );
    }
    finally {
      sdk.close();
      await server.shutdown();
    }
  });

  describe('#close', () => {
    test('closes the shared channel idempotently', () => {
      const sdk = new TinkoffInvestNodeSDK({
        token: 'token',
        endpoint: 'localhost:50051',
        useSsl: false
      });

      assert.doesNotThrow(() => {
        sdk.close();
        sdk.close();
      });
    });

    test('rejects service access after close', () => {
      const sdk = new TinkoffInvestNodeSDK({
        token: 'token',
        endpoint: 'localhost:50051',
        useSsl: false
      });

      sdk.close();

      assert.throws(
        () => sdk.users,
        (error: unknown) => isSdkError(error, SdkErrorCode.SdkClosed)
          && error.source === 'lifecycle'
      );
    });

    test('rejects calls through an existing client after close', async () => {
      const sdk = new TinkoffInvestNodeSDK({
        token: 'token',
        endpoint: 'localhost:50051',
        useSsl: false
      });
      const users = sdk.users;

      sdk.close();

      await assert.rejects(
        users.getAccounts({}),
        (error: unknown) => isSdkError(error, SdkErrorCode.SdkClosed)
          && error.source === 'lifecycle'
      );
    });
  });
});
