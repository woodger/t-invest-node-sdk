import assert from 'node:assert';
import test from 'node:test';
import { createSdkMiddleware } from './sdk-internals';
import { Throttle } from './throttle';

function createUnaryCall(path: string) {
  return {
    request: {},
    responseStream: false,
    method: { path },
    next: async function*() {
      return { ok: true };
    }
  } as any;
}

test('middleware uses throttle from the current sdk instance', async () => {
  const throttleA = new Throttle({});
  const throttleB = new Throttle({});

  let callsA = 0;
  let callsB = 0;

  throttleA.reduce = async (path: string) => {
    callsA += 1;
    assert.equal(path, '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts');
  };

  throttleB.reduce = async (path: string) => {
    callsB += 1;
    assert.equal(path, '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts');
  };

  const middlewareA = createSdkMiddleware(true, throttleA);
  const middlewareB = createSdkMiddleware(true, throttleB);

  await middlewareA(
    createUnaryCall('/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts'),
    {}
  ).next();
  await middlewareB(
    createUnaryCall('/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts'),
    {}
  ).next();

  assert.equal(callsA, 1);
  assert.equal(callsB, 1);
});

test('middleware skips throttle when trackLimits is disabled', async () => {
  const throttle = new Throttle({});

  let throttleCalls = 0;

  throttle.reduce = async () => {
    throttleCalls += 1;
  };

  const middleware = createSdkMiddleware(false, throttle);

  await middleware(
    createUnaryCall('/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts'),
    {}
  ).next();

  assert.equal(throttleCalls, 0);
});
