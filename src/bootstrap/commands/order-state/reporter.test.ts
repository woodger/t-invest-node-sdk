import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { MoneyValue } from '../../../generated/common';
import {
  OrderDirection,
  OrderExecutionReportStatus,
  OrderType,
  type OrderState
} from '../../../generated/orders';
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
  };
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
        initialOrderPrice: '100.5 rub',
        executedOrderPrice: '20.25 rub',
        totalOrderAmount: '200 rub',
        averagePositionPrice: '10 rub',
        initialCommission: '1 rub',
        executedCommission: '0.5 rub',
        serviceCommission: '0.25 rub',
        currency: 'rub',
        orderDate: '2026-06-19T10:00:00.000Z',
        stages: [
          {
            price: '10 rub',
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
      assert.equal(parsed.initialOrderPrice, '100.5 rub');
      assert.equal(parsed.stages[0].tradeId, 'trade-id');
    });
  });
});
