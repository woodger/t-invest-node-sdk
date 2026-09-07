import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
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
  } as OrderState;
}

describe('order-state reporter', () => {
  describe('formatOrderStateReport', () => {
    test('formats report as table', () => {
      const output = formatOrderStateReport(createSingleOrderStateReport(orderState()), 'table');

      assert.match(output, /^orderId\s+figi\s+instrumentUid\s+status/m);
      assert.match(output, /order-id\s+BBG00QPYJ5H0\s+instrument-uid\s+EXECUTION_REPORT_STATUS_NEW/);
      assert.match(output, /ORDER_DIRECTION_BUY\s+ORDER_TYPE_LIMIT\s+10\s+2/);
      assert.match(output, /100.5 rub\s+20.25 rub\s+200 rub\s+2026-06-19T10:00:00.000Z/);
    });

    test('formats report as json', () => {
      const report = createSingleOrderStateReport(orderState());
      const output = formatOrderStateReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });
  });
});
