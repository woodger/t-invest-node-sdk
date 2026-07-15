import assert from 'node:assert';
import { describe, test } from 'node:test';
import { Throttle } from './application/services/unary-throttle.service';
import { defaultConfig, resolveUnaryLimits } from './config';
import { defineUnaryLimits } from './infrastructure/transport/grpc/unary-limits';

describe('defaultConfig', () => {
  test('applies current service-level unary limits', () => {
    const throttle = new Throttle(defaultConfig.unaryLimits);
    const expectedLimits = {
      '/tinkoff.public.invest.api.contract.v1.InstrumentsService/GetInstrumentBy': 200,
      '/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles': 600,
      '/tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio': 200,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState': 100,
      '/tinkoff.public.invest.api.contract.v1.SandboxService/GetSandboxAccounts': 200,
      '/tinkoff.public.invest.api.contract.v1.StopOrdersService/PostStopOrder': 50,
      '/tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts': 100
    };

    for (const [path, limit] of Object.entries(expectedLimits)) {
      assert.equal(throttle.resolveLimit(path), limit);
    }
  });

  test('applies lower method-specific limits before service fallbacks', () => {
    const throttle = new Throttle(defaultConfig.unaryLimits);
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
      assert.equal(throttle.resolveLimit(path), limit);
    }
  });

  test('applies higher method-specific limits before service fallbacks', () => {
    const throttle = new Throttle(defaultConfig.unaryLimits);
    const expectedLimits = {
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrders': 200,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder': 900,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrderAsync': 600,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/CancelOrder': 300,
      '/tinkoff.public.invest.api.contract.v1.OrdersService/ReplaceOrder': 300,
      '/tinkoff.public.invest.api.contract.v1.StopOrdersService/GetStopOrders': 60
    };

    for (const [path, limit] of Object.entries(expectedLimits)) {
      assert.equal(throttle.resolveLimit(path), limit);
    }
  });
});

describe('resolveUnaryLimits', () => {
  test('merges per-instance overrides over package defaults', () => {
    const limits = resolveUnaryLimits({
      UsersService: 25
    });

    assert.equal(limits['UsersService'], 25);
    assert.equal(limits['MarketDataService'], 600);
  });

  test('merges method overrides produced from nested definitions', () => {
    const limits = resolveUnaryLimits(defineUnaryLimits({
      OrdersService: {
        methods: {
          PostOrder: 300
        }
      }
    }));
    const throttle = new Throttle(limits);

    assert.equal(throttle.resolveLimit(
      '/tinkoff.public.invest.api.contract.v1.OrdersService/PostOrder'
    ), 300);
    assert.equal(throttle.resolveLimit(
      '/tinkoff.public.invest.api.contract.v1.OrdersService/GetOrderState'
    ), 100);
  });

  test('returns an isolated snapshot for each resolution', () => {
    const first = resolveUnaryLimits();
    const second = resolveUnaryLimits();

    first['UsersService'] = 25;

    assert.equal(second['UsersService'], 100);
    assert.equal(defaultConfig.unaryLimits['UsersService'], 100);
  });
});
