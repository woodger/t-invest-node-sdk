import assert from 'node:assert';
import test from 'node:test';
import { createSdkMiddleware } from './sdk-internals';
import { Throttle } from './throttle';
import { TinkoffInvestNodeSDK } from './tinkoff-invest-node-sdk';

function createUnaryResponseIterator<Response>(response: Response): AsyncIterableIterator<Response> {
  const iterator: AsyncIterableIterator<Response> = {
    async next() {
      return { done: true, value: response };
    },
    [Symbol.asyncIterator]() {
      return iterator;
    }
  };

  return iterator;
}

function createUnaryCall(path: string) {
  return {
    request: {},
    responseStream: false,
    method: { path },
    next() {
      return createUnaryResponseIterator({ ok: true });
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

test('sdk exposes stream clients', () => {
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

test('sdk close closes the shared channel', () => {
  const sdk = new TinkoffInvestNodeSDK({
    token: 'token',
    endpoint: 'localhost:50051',
    useSsl: false
  });

  assert.doesNotThrow(() => sdk.close());
});
