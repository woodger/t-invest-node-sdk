import assert from 'node:assert';
import test from 'node:test';
import { UsersServiceDefinition } from './generated/users';
import {
  createSdkChannel,
  createSdkClient,
  createSdkMetadata,
  createSdkMiddleware
} from './sdk-internals';
import { Throttle } from './throttle';

function createUnaryCall(path: string, response = { ok: true }) {
  return {
    request: {},
    responseStream: false,
    method: { path },
    next: async function*() {
      return response;
    }
  } as any;
}

function createResponseStreamCall(path: string, responses: unknown[]) {
  return {
    request: {},
    responseStream: true,
    method: { path },
    next: async function*() {
      for (const response of responses) {
        yield response;
      }
    }
  } as any;
}

test('createSdkMetadata adds authorization header', () => {
  const metadata = createSdkMetadata({
    token: 'token',
    endpoint: 'localhost:50051'
  });

  assert.equal(metadata.get('Authorization'), 'Bearer token');
  assert.equal(metadata.get('x-app-name'), undefined);
});

test('createSdkMetadata adds x-app-name when it is provided', () => {
  const metadata = createSdkMetadata({
    token: 'token',
    endpoint: 'localhost:50051',
    appName: 'sdk-app'
  });

  assert.equal(metadata.get('Authorization'), 'Bearer token');
  assert.equal(metadata.get('x-app-name'), 'sdk-app');
});

test('createSdkMiddleware throttles unary calls when trackLimits is enabled', async () => {
  const throttle = new Throttle({});
  let throttleCalls = 0;

  throttle.reduce = async (path: string) => {
    throttleCalls += 1;
    assert.equal(path, '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts');
  };

  const middleware = createSdkMiddleware(true, throttle);
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

test('createSdkMiddleware does not throttle response streams', async () => {
  const throttle = new Throttle({});
  let throttleCalls = 0;

  throttle.reduce = async () => {
    throttleCalls += 1;
  };

  const middleware = createSdkMiddleware(true, throttle);
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

test('createSdkChannel creates a channel object for the configured endpoint', () => {
  const channel = createSdkChannel({
    token: 'token',
    endpoint: 'localhost:50051',
    useSsl: false
  });

  assert.ok(channel);
  assert.equal(typeof channel.close, 'function');
});

test('createSdkClient creates a typed client for the service definition', () => {
  const channel = createSdkChannel({
    token: 'token',
    endpoint: 'localhost:50051',
    useSsl: false
  });
  const metadata = createSdkMetadata({
    token: 'token',
    endpoint: 'localhost:50051'
  });
  const throttle = new Throttle({});
  const client = createSdkClient<{ getAccounts: unknown }>(
    UsersServiceDefinition,
    channel,
    metadata,
    true,
    throttle
  );

  assert.equal(typeof client.getAccounts, 'function');
});
