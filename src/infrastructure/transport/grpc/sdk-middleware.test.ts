import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type { CallOptions, ClientMiddlewareCall } from 'nice-grpc';
import {
  ClientError,
  Status
} from 'nice-grpc';
import {
  isSdkError,
  SdkError,
  SdkErrorCode
} from '../../../application/errors/sdk-error';
import { Throttle } from '../../../application/services/unary-throttle.service';
import { createSdkMiddleware } from './sdk-middleware';
import { UnaryLimitResolver } from './unary-limit-resolver';

type TestRequest = Record<string, never>;

const defaultUnaryResponse = { ok: true };
const usersPath = '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts';

async function* createUnaryResponseIterator<Response>(
  response: Response
): AsyncGenerator<never, Response, undefined> {
  const emptyUnaryResponses: never[] = [];

  for (const value of emptyUnaryResponses) {
    yield value;
  }

  return response;
}

async function* createRejectedIterator(
  error: unknown
): AsyncGenerator<never, never, undefined> {
  const responses: never[] = [];

  for (const response of responses) {
    yield response;
  }

  throw error;
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

function createRejectedUnaryCall(
  path: string,
  error: unknown
): ClientMiddlewareCall<TestRequest, typeof defaultUnaryResponse, CallOptions> {
  return {
    ...createUnaryCall(path),
    next() {
      return createRejectedIterator(error);
    }
  };
}

function createRejectedResponseStreamCall(
  path: string,
  error: unknown
): ClientMiddlewareCall<TestRequest, typeof defaultUnaryResponse, CallOptions> {
  return {
    ...createResponseStreamCall(path, []),
    next() {
      return createRejectedIterator(error);
    }
  };
}

describe('createSdkMiddleware', () => {
  test('throttles unary calls when trackLimits is enabled', async () => {
    const resolver = new UnaryLimitResolver({
      UsersService: 100
    });
    const expectedRule = resolver.resolve(usersPath);
    const throttle = new Throttle();
    let throttleCalls = 0;

    if (expectedRule === undefined) {
      assert.fail('Expected UsersService throttle rule');
    }

    throttle.reduce = async (rule) => {
      throttleCalls += 1;
      assert.deepEqual(rule, expectedRule);
    };

    const middleware = createSdkMiddleware(true, resolver, throttle);
    const iterator = middleware(createUnaryCall(usersPath), {});

    const result = await iterator.next();

    assert.equal(throttleCalls, 1);
    assert.deepEqual(result, {
      done: true,
      value: { ok: true }
    });
  });

  test('uses dependencies from the current middleware instance', async () => {
    const resolverA = new UnaryLimitResolver({ UsersService: 100 });
    const resolverB = new UnaryLimitResolver({ UsersService: 50 });
    const throttleA = new Throttle();
    const throttleB = new Throttle();
    let callsA = 0;
    let callsB = 0;

    throttleA.reduce = async (rule) => {
      callsA += 1;
      assert.equal(rule.limitPerMinute, 100);
    };

    throttleB.reduce = async (rule) => {
      callsB += 1;
      assert.equal(rule.limitPerMinute, 50);
    };

    const middlewareA = createSdkMiddleware(true, resolverA, throttleA);
    const middlewareB = createSdkMiddleware(true, resolverB, throttleB);

    const [resultA, resultB] = await Promise.all([
      middlewareA(createUnaryCall(usersPath), {}).next(),
      middlewareB(createUnaryCall(usersPath), {}).next()
    ]);

    assert.equal(callsA, 1);
    assert.equal(callsB, 1);
    assert.deepEqual(resultA, {
      done: true,
      value: { ok: true }
    });
    assert.deepEqual(resultB, resultA);
  });

  test('skips unary throttling when trackLimits is disabled', async () => {
    const throttle = new Throttle();
    let throttleCalls = 0;

    throttle.reduce = async () => {
      throttleCalls += 1;
    };

    const middleware = createSdkMiddleware(
      false,
      new UnaryLimitResolver({}),
      throttle
    );
    const result = await middleware(createUnaryCall(usersPath), {}).next();

    assert.equal(throttleCalls, 0);
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
    const iterator = middleware(createUnaryCall(usersPath), {});

    await assert.rejects(
      iterator.next(),
      (error: unknown) => isSdkError(error, SdkErrorCode.UnknownUnaryLimit)
        && error.source === 'sdk'
        && error.path === usersPath
    );
  });

  test('cancels local throttle waiting through call signal', async () => {
    const resolver = new UnaryLimitResolver({
      UsersService: 100
    });
    const throttle = new Throttle();
    const rule = resolver.resolve(usersPath);

    if (rule === undefined) {
      assert.fail('Expected UsersService throttle rule');
    }

    await throttle.reduce(rule);

    const controller = new AbortController();
    const middleware = createSdkMiddleware(true, resolver, throttle);
    const result = middleware(createUnaryCall(usersPath), {
      signal: controller.signal
    }).next();

    controller.abort();

    await assert.rejects(
      result,
      (error: unknown) => isSdkError(error, SdkErrorCode.Cancelled)
        && error.source === 'abort'
    );
  });

  test('cancels local throttle waiting when SDK lifecycle closes', async () => {
    const resolver = new UnaryLimitResolver({
      UsersService: 100
    });
    const throttle = new Throttle();
    const rule = resolver.resolve(usersPath);

    if (rule === undefined) {
      assert.fail('Expected UsersService throttle rule');
    }

    await throttle.reduce(rule);

    const lifecycleController = new AbortController();
    const closeError = new SdkError(
      SdkErrorCode.SdkClosed,
      'TInvestNodeSDK is closed',
      {
        source: 'lifecycle'
      }
    );
    const middleware = createSdkMiddleware(
      true,
      resolver,
      throttle,
      {
        signal: lifecycleController.signal,
        assertOpen() {
          if (lifecycleController.signal.aborted) {
            throw closeError;
          }
        }
      }
    );
    const result = middleware(createUnaryCall(usersPath), {}).next();

    lifecycleController.abort(closeError);

    await assert.rejects(
      result,
      (error: unknown) => error === closeError
    );
  });

  test('maps gRPC client errors to the public SDK contract', async () => {
    const path = '/test.Service/Method';
    const providerError = new ClientError(
      path,
      Status.UNAUTHENTICATED,
      'invalid token'
    );
    const middleware = createSdkMiddleware(
      false,
      new UnaryLimitResolver({}),
      new Throttle()
    );
    const iterator = middleware(
      createRejectedUnaryCall(path, providerError),
      {}
    );

    await assert.rejects(
      iterator.next(),
      (error: unknown) => isSdkError(error, SdkErrorCode.Unauthenticated)
        && error.source === 'grpc'
        && error.path === path
        && error.details === 'invalid token'
        && error.cause === providerError
    );
  });

  test('maps response stream errors to the public SDK contract', async () => {
    const path = '/test.StreamService/Watch';
    const providerError = new ClientError(
      path,
      Status.UNAVAILABLE,
      'temporarily unavailable'
    );
    const middleware = createSdkMiddleware(
      false,
      new UnaryLimitResolver({}),
      new Throttle()
    );
    const iterator = middleware(
      createRejectedResponseStreamCall(path, providerError),
      {}
    );

    await assert.rejects(
      iterator.next(),
      (error: unknown) => isSdkError(error, SdkErrorCode.Unavailable)
        && error.source === 'grpc'
        && error.path === path
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
      createResponseStreamCall('/test.StreamService/Watch', [
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
