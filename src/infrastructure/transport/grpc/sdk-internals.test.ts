import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { CallOptions, ClientMiddlewareCall } from 'nice-grpc';
import { Throttle } from '../../../application/services/unary-throttle.service';
import { UsersServiceDefinition } from '../../../generated/users';
import {
  createSdkChannel,
  createSdkClient,
  createSdkMetadata,
  createSdkMiddleware,
  UnaryLimitResolver
} from './index';

type TestRequest = Record<string, never>;
const defaultUnaryResponse = { ok: true };

async function* createUnaryResponseIterator<Response>(
  response: Response
): AsyncGenerator<never, Response, undefined> {
  const emptyUnaryResponses: never[] = [];

  for (const value of emptyUnaryResponses) {
    yield value;
  }

  return response;
}

function createUnaryCall<Response = typeof defaultUnaryResponse>(
  path: string,
  response: Response = defaultUnaryResponse as Response
): ClientMiddlewareCall<TestRequest, Response, CallOptions> {
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
      return createUnaryResponseIterator(response);
    }
  };
}

function createResponseStreamCall<Response>(
  path: string,
  responses: Response[]
): ClientMiddlewareCall<TestRequest, Response, CallOptions> {
  return {
    requestStream: false,
    request: {},
    responseStream: true,
    method: {
      path,
      requestStream: false,
      responseStream: true,
      options: {}
    },
    next: async function*() {
      for (const response of responses) {
        yield response;
      }
    }
  };
}

describe('infrastructure transport grpc', () => {
  describe('createSdkMetadata', () => {
    test('adds authorization header', () => {
      const metadata = createSdkMetadata({
        token: 'token',
        endpoint: 'localhost:50051'
      });

      assert.equal(metadata.get('Authorization'), 'Bearer token');
      assert.equal(metadata.get('x-app-name'), undefined);
    });

    test('adds x-app-name when it is provided', () => {
      const metadata = createSdkMetadata({
        token: 'token',
        endpoint: 'localhost:50051',
        appName: 'sdk-app'
      });

      assert.equal(metadata.get('Authorization'), 'Bearer token');
      assert.equal(metadata.get('x-app-name'), 'sdk-app');
    });
  });

  describe('createSdkMiddleware', () => {
    test('throttles unary calls when trackLimits is enabled', async () => {
      const resolver = new UnaryLimitResolver({
        UsersService: 100
      });
      const throttle = new Throttle();
      let throttleCalls = 0;

      throttle.reduce = async (rule) => {
        throttleCalls += 1;
        assert.deepEqual(rule, {
          bucket: 'rule:UsersService',
          limitPerMinute: 100
        });
      };

      const middleware = createSdkMiddleware(true, resolver, throttle);
      const iterator = middleware(
        createUnaryCall('/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts'),
        {}
      );

      const result = await iterator.next();

      assert.equal(throttleCalls, 1);
      assert.deepEqual(result, {
        done: true,
        value: { ok: true }
      });
    });

    test('rejects a unary call without a configured limit rule', async () => {
      const middleware = createSdkMiddleware(
        true,
        new UnaryLimitResolver({}),
        new Throttle()
      );
      const iterator = middleware(
        createUnaryCall('/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts'),
        {}
      );

      await assert.rejects(
        iterator.next(),
        /Unhandled unary limits for .*UsersService\/GetAccounts/
      );
    });

    test('does not throttle response streams', async () => {
      const resolver = new UnaryLimitResolver({});
      const throttle = new Throttle();
      let throttleCalls = 0;

      throttle.reduce = async () => {
        throttleCalls += 1;
      };

      const middleware = createSdkMiddleware(true, resolver, throttle);
      const iterator = middleware(
        createResponseStreamCall('/tinkoff.public.invest.api.contract.v1.OperationsStreamService/PortfolioStream', [
          { seq: 1 },
          { seq: 2 }
        ]),
        {}
      );

      const responses = [];

      for await (const response of iterator) {
        responses.push(response);
      }

      assert.equal(throttleCalls, 0);
      assert.deepEqual(responses, [{ seq: 1 }, { seq: 2 }]);
    });
  });

  describe('createSdkChannel', () => {
    test('creates a channel object for the configured endpoint', () => {
      const channel = createSdkChannel({
        token: 'token',
        endpoint: 'localhost:50051',
        useSsl: false
      });

      assert.ok(channel);
      assert.equal(typeof channel.close, 'function');
    });
  });

  describe('createSdkClient', () => {
    test('creates a typed client for the service definition', () => {
      const channel = createSdkChannel({
        token: 'token',
        endpoint: 'localhost:50051',
        useSsl: false
      });
      const metadata = createSdkMetadata({
        token: 'token',
        endpoint: 'localhost:50051'
      });
      const resolver = new UnaryLimitResolver({ UsersService: 100 });
      const throttle = new Throttle();
      const client = createSdkClient<{ getAccounts: unknown }>(
        UsersServiceDefinition,
        channel,
        metadata,
        true,
        resolver,
        throttle
      );

      assert.equal(typeof client.getAccounts, 'function');
    });
  });
});
