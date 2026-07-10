import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import type { MoneyValue } from '../../../generated/t_tech/invest/grpc/common';
import {
  OrderDirection,
  OrderExecutionReportStatus,
  OrderType,
  type OrderState
} from '../../../generated/t_tech/invest/grpc/orders';
import { createSingleOrderStateReport, formatOrderStateReport } from './reporter';

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function orderState(overrides: Partial<OrderState> = {}): OrderState {
  return {
    orderId: 'order-id',
    orderRequestId: 'request-id',
    figi: 'BBG00QPYJ5H0',
    instrumentUid: 'instrument-uid',
    executionReportStatus: OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_NEW,
    direction: OrderDirection.ORDER_DIRECTION_BUY,
    orderType: OrderType.ORDER_TYPE_LIMIT,
    lotsRequested: 10,
    lotsExecuted: 2,
    initialOrderPrice: money(100, 500000000),
    executedOrderPrice: money(20, 250000000),
    totalOrderAmount: money(200, 0),
    averagePositionPrice: money(10, 0),
    initialCommission: money(1, 0),
    executedCommission: money(0, 500000000),
    initialSecurityPrice: money(10, 0),
    serviceCommission: money(0, 250000000),
    currency: 'rub',
    orderDate: new Date('2026-06-19T10:00:00.000Z'),
    stages: [
      {
        price: money(10, 0),
        quantity: 2,
        tradeId: 'trade-id'
      }
    ],
    ...overrides
  } as OrderState;
}

describe('order-state reporter', () => {
  describe('createSingleOrderStateReport', () => {
    test('maps generated order state fields to stable report values', () => {
      const report = createSingleOrderStateReport(orderState());

      assert.deepEqual(report, {
        orderId: 'order-id',
        orderRequestId: 'request-id',
        figi: 'BBG00QPYJ5H0',
        instrumentUid: 'instrument-uid',
        status: 'EXECUTION_REPORT_STATUS_NEW',
        direction: 'ORDER_DIRECTION_BUY',
        orderType: 'ORDER_TYPE_LIMIT',
        lotsRequested: 10,
        lotsExecuted: 2,
        initialOrderPrice: {
          currency: 'rub',
          amount: '100.5'
        },
        executedOrderPrice: {
          currency: 'rub',
          amount: '20.25'
        },
        totalOrderAmount: {
          currency: 'rub',
          amount: '200'
        },
        averagePositionPrice: {
          currency: 'rub',
          amount: '10'
        },
        initialCommission: {
          currency: 'rub',
          amount: '1'
        },
        executedCommission: {
          currency: 'rub',
          amount: '0.5'
        },
        serviceCommission: {
          currency: 'rub',
          amount: '0.25'
        },
        currency: 'rub',
        orderDate: '2026-06-19T10:00:00.000Z',
        stages: [
          {
            price: {
              currency: 'rub',
              amount: '10'
            },
            quantity: 2,
            tradeId: 'trade-id'
          }
        ]
      });
    });
  });

  describe('formatOrderStateReport', () => {
    test('formats report as table', () => {
      const output = formatOrderStateReport(createSingleOrderStateReport(orderState()), 'table');

      assert.match(output, /^orderId\s+figi\s+instrumentUid\s+status/m);
      assert.match(output, /order-id\s+BBG00QPYJ5H0\s+instrument-uid\s+EXECUTION_REPORT_STATUS_NEW/);
      assert.match(output, /ORDER_DIRECTION_BUY\s+ORDER_TYPE_LIMIT\s+10\s+2/);
      assert.match(output, /100.5 rub\s+20.25 rub\s+200 rub\s+2026-06-19T10:00:00.000Z/);
    });

    test('formats report as json', () => {
      const output = formatOrderStateReport(createSingleOrderStateReport(orderState()), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed.orderId, 'order-id');
      assert.equal(parsed.status, 'EXECUTION_REPORT_STATUS_NEW');
      assert.deepEqual(parsed.initialOrderPrice, {
        currency: 'rub',
        amount: '100.5'
      });
      assert.equal(parsed.stages.at(0)?.tradeId, 'trade-id');
    });
  });
});
