import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import type { CallOptions, ClientMiddlewareCall } from 'nice-grpc';
import { ClientError, Metadata, Status } from 'nice-grpc';
import { isSdkError, SdkError, SdkErrorCode } from '../../../application/errors/sdk-error';
import type { TInvestUnaryLimitContext, TInvestUnaryLimiter } from '../../../application/services/unary-limiter';
import { createInMemoryUnaryLimiter } from '../../../application/services/unary-limiter';
import { createSdkMiddleware, type SdkCallErrorClassificationOptions, type SdkCallLifecycle } from './sdk-middleware';
import { UnaryLimitResolver } from './unary-limit-resolver';

type TestRequest = Record<string, never>;

const defaultUnaryResponse = { ok: true };
const usersPath =
  '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts';
const usersLimit = {
  maxRequests: 100,
  windowMs: 60_000
};

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
    next: async function* () {
      for (const response of responses) {
        yield response;
      }
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

function createOpenLifecycle(): SdkCallLifecycle {
  const signal = new AbortController().signal;

  return {
    signal,
    assertOpen() {
      if (signal.aborted) {
        throw signal.reason;
      }
    }
  };
}

function createErrorClassification(
  useSsl: boolean
): SdkCallErrorClassificationOptions {
  return {
    useSsl,
    maxReceiveMessageLength: 4_194_304
  };
}

describe('createSdkMiddleware', () => {
  test(
    'passes a resolved quota to the unary limiter before transport',
    async () => {
      const resolver = new UnaryLimitResolver({
        UsersService: usersLimit
      });
      let receivedContext: TInvestUnaryLimitContext | undefined;
      const limiter: TInvestUnaryLimiter = {
        async acquire(context) {
          receivedContext = context;
        }
      };

      const middleware = createSdkMiddleware(limiter, resolver);
      const iterator = middleware(createUnaryCall(usersPath), {});

      const result = await iterator.next();

      assert.equal(receivedContext?.path, usersPath);
      assert.deepEqual(receivedContext?.quota, {
        bucket: 'rule:UsersService',
        ...usersLimit
      });
      assert.equal(receivedContext?.signal.aborted, false);
      assert.deepEqual(result, {
        done: true,
        value: { ok: true }
      });
    }
  );

  test('uses dependencies from the current middleware instance', async () => {
    const resolverA = new UnaryLimitResolver({ UsersService: usersLimit });
    const resolverB = new UnaryLimitResolver({
      UsersService: {
        maxRequests: 50,
        windowMs: 60_000
      }
    });
    let callsA = 0;
    let callsB = 0;
    const limiterA: TInvestUnaryLimiter = {
      async acquire({ quota }) {
        callsA += 1;
        assert.equal(quota.maxRequests, 100);
      }
    };
    const limiterB: TInvestUnaryLimiter = {
      async acquire({ quota }) {
        callsB += 1;
        assert.equal(quota.maxRequests, 50);
      }
    };

    const middlewareA = createSdkMiddleware(limiterA, resolverA);
    const middlewareB = createSdkMiddleware(limiterB, resolverB);

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

  test(
    'dispatches unary calls immediately when no limiter is supplied',
    async () => {
      const middleware = createSdkMiddleware(
        undefined,
        new UnaryLimitResolver({})
      );
      const result = await middleware(createUnaryCall(usersPath), {}).next();

      assert.deepEqual(result, {
        done: true,
        value: { ok: true }
      });
    }
  );

  test('rejects a unary call without a configured limit rule', async () => {
    const middleware = createSdkMiddleware(
      createInMemoryUnaryLimiter(),
      new UnaryLimitResolver({})
    );
    const iterator = middleware(createUnaryCall(usersPath), {});

    await assert.rejects(
      iterator.next(),
      (error: unknown) =>
        isSdkError(error, SdkErrorCode.UnknownUnaryLimit)
        && error.source === 'sdk'
        && error.path === usersPath
    );
  });

  test('cancels limiter waiting through call signal', async () => {
    const resolver = new UnaryLimitResolver({
      UsersService: usersLimit
    });
    const limiter = createInMemoryUnaryLimiter();
    const quota = resolver.resolve(usersPath);

    if (quota === undefined) {
      assert.fail('Expected UsersService quota');
    }

    await limiter.acquire({
      path: usersPath,
      quota,
      signal: new AbortController().signal
    });

    const controller = new AbortController();
    const middleware = createSdkMiddleware(limiter, resolver);
    const result = middleware(createUnaryCall(usersPath), {
      signal: controller.signal
    }).next();

    controller.abort();

    await assert.rejects(
      result,
      (error: unknown) =>
        isSdkError(error, SdkErrorCode.Cancelled)
        && error.source === 'abort'
    );
  });

  test('cancels limiter waiting when SDK lifecycle closes', async () => {
    const resolver = new UnaryLimitResolver({
      UsersService: usersLimit
    });
    const limiter = createInMemoryUnaryLimiter();
    const quota = resolver.resolve(usersPath);

    if (quota === undefined) {
      assert.fail('Expected UsersService quota');
    }

    await limiter.acquire({
      path: usersPath,
      quota,
      signal: new AbortController().signal
    });

    const lifecycleController = new AbortController();
    const closeError = new SdkError(
      SdkErrorCode.SdkClosed,
      'TInvestNodeSDK is closed',
      {
        source: 'lifecycle'
      }
    );
    const middleware = createSdkMiddleware(
      limiter,
      resolver,
      {
        signal: lifecycleController.signal,
        assertOpen() {
          if (lifecycleController.signal.aborted) {
            throw closeError;
          }
        }
      },
      {
        useSsl: false,
        maxReceiveMessageLength: 4_194_304
      }
    );
    const result = middleware(createUnaryCall(usersPath), {}).next();

    lifecycleController.abort(closeError);

    await assert.rejects(
      result,
      (error: unknown) => error === closeError
    );
  });

  test('propagates a limiter failure without transport remapping', async () => {
    const limiterError = new ClientError(
      usersPath,
      Status.UNAVAILABLE,
      'coordinator unavailable'
    );
    const limiter: TInvestUnaryLimiter = {
      async acquire() {
        throw limiterError;
      }
    };
    const middleware = createSdkMiddleware(
      limiter,
      new UnaryLimitResolver({ UsersService: usersLimit })
    );

    await assert.rejects(
      middleware(createUnaryCall(usersPath), {}).next(),
      (error: unknown) => error === limiterError
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
      undefined,
      new UnaryLimitResolver({}),
      createOpenLifecycle(),
      createErrorClassification(true)
    );
    const iterator = middleware(
      createRejectedResponseStreamCall(path, providerError),
      {}
    );

    await assert.rejects(
      iterator.next(),
      (error: unknown) =>
        isSdkError(error, SdkErrorCode.Unavailable)
        && error.source === 'grpc'
        && error.path === path
    );
  });

  test('does not invoke the unary limiter for response streams', async () => {
    const resolver = new UnaryLimitResolver({});
    let limiterCalls = 0;
    const limiter: TInvestUnaryLimiter = {
      async acquire() {
        limiterCalls += 1;
      }
    };

    const middleware = createSdkMiddleware(limiter, resolver);
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

    assert.equal(limiterCalls, 0);
    assert.deepEqual(responses, [{ seq: 1 }, { seq: 2 }]);
  });

  test(
    'rejects a response stream when a metadata callback throws',
    async () => {
      const path = '/test.StreamService/Watch';
      const callbackError = new Error('stream header callback failed');
      const call: ClientMiddlewareCall<
        TestRequest,
        typeof defaultUnaryResponse,
        CallOptions
      > = {
        requestStream: false,
        request: {},
        responseStream: true,
        method: {
          path,
          requestStream: false,
          responseStream: true,
          options: {}
        },
        next: async function* (_request, options) {
          options.onHeader?.(new Metadata());
          yield defaultUnaryResponse;
        }
      };
      const middleware = createSdkMiddleware(
        undefined,
        new UnaryLimitResolver({})
      );
      const iterator = middleware(call, {
        onHeader() {
          throw callbackError;
        }
      });

      await assert.rejects(
        iterator.next(),
        (error: unknown) => error === callbackError
      );
    }
  );

  test('isolates callback failures between concurrent calls', async () => {
    const path = '/test.StreamService/Watch';
    const callbackError = new Error('stream trailer callback failed');
    let failedCallSignal: AbortSignal | undefined;
    let healthyCallSignal: AbortSignal | undefined;
    let healthyTrailerCalls = 0;
    const failingCall: ClientMiddlewareCall<
      TestRequest,
      { seq: number },
      CallOptions
    > = {
      ...createResponseStreamCall(path, [{ seq: 1 }]),
      responseStream: true,
      next: async function* (_request, options) {
        failedCallSignal = options.signal;
        yield { seq: 1 };
        options.onTrailer?.(new Metadata());
      }
    };
    const healthyCall: ClientMiddlewareCall<
      TestRequest,
      { seq: number },
      CallOptions
    > = {
      ...createResponseStreamCall(path, [{ seq: 1 }, { seq: 2 }]),
      responseStream: true,
      next: async function* (_request, options) {
        healthyCallSignal = options.signal;
        yield { seq: 1 };

        if (options.signal?.aborted) {
          throw options.signal.reason;
        }

        yield { seq: 2 };
        options.onTrailer?.(new Metadata());
      }
    };
    const middleware = createSdkMiddleware(
      undefined,
      new UnaryLimitResolver({})
    );
    const failing = middleware(failingCall, {
      onTrailer() {
        throw callbackError;
      }
    });
    const healthy = middleware(healthyCall, {
      onTrailer() {
        healthyTrailerCalls += 1;
      }
    });

    try {
      assert.deepEqual(await Promise.all([
        failing.next(),
        healthy.next()
      ]), [
        { done: false, value: { seq: 1 } },
        { done: false, value: { seq: 1 } }
      ]);

      await assert.rejects(
        failing.next(),
        (error: unknown) => error === callbackError
      );

      assert.equal(failedCallSignal?.aborted, true);
      assert.equal(healthyCallSignal?.aborted, false);
      assert.deepEqual(await healthy.next(), {
        done: false,
        value: { seq: 2 }
      });
      assert.deepEqual(await healthy.next(), {
        done: true,
        value: undefined
      });
      assert.equal(healthyTrailerCalls, 1);
    }
    finally {
      await Promise.all([failing.return(undefined), healthy.return(undefined)]);
    }
  });

  test('preserves an undefined callback failure over later failures', async () => {
    const callbackFailure: unknown = undefined;
    const call: ClientMiddlewareCall<
      TestRequest,
      typeof defaultUnaryResponse,
      CallOptions
    > = {
      ...createUnaryCall(usersPath),
      next(_request, options) {
        options.onHeader?.(new Metadata());
        options.onTrailer?.(new Metadata());

        return createRejectedIterator(new ClientError(
          usersPath,
          Status.CANCELLED,
          'transport cancelled'
        ));
      }
    };
    const middleware = createSdkMiddleware(
      undefined,
      new UnaryLimitResolver({})
    );
    const iterator = middleware(call, {
      onHeader() {
        throw callbackFailure;
      },
      onTrailer() {
        throw new Error('trailer callback failed');
      }
    });

    await assert.rejects(
      iterator.next(),
      (error: unknown) => error === callbackFailure
    );
  });

  test('propagates a trailer callback failure when a stream is closed early', async () => {
    const path = '/test.StreamService/Watch';
    const callbackError = new Error('stream trailer callback failed');
    const call: ClientMiddlewareCall<
      TestRequest,
      typeof defaultUnaryResponse,
      CallOptions
    > = {
      ...createResponseStreamCall(path, [defaultUnaryResponse]),
      responseStream: true,
      next: async function* (_request, options) {
        try {
          yield defaultUnaryResponse;
        }
        finally {
          options.onTrailer?.(new Metadata());
        }
      }
    };
    const middleware = createSdkMiddleware(
      undefined,
      new UnaryLimitResolver({})
    );
    const iterator = middleware(call, {
      onTrailer() {
        throw callbackError;
      }
    });

    assert.deepEqual(await iterator.next(), {
      done: false,
      value: defaultUnaryResponse
    });
    await assert.rejects(
      iterator.return(undefined),
      (error: unknown) => error === callbackError
    );
  });
});
