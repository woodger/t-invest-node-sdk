import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { MoneyValue } from '../../../generated/common';
import {
  OrderDirection,
  OrderExecutionReportStatus,
  OrderType,
  type GetOrdersResponse,
  type OrderState
} from '../../../generated/orders';
import { createOrdersReport, formatOrdersReport } from './reporter';

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function order(overrides: Partial<OrderState> = {}): OrderState {
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

function orders(overrides: Partial<GetOrdersResponse> = {}): GetOrdersResponse {
  return {
    orders: [order()],
    ...overrides
  };
}

describe('orders reporter', () => {
  describe('createOrdersReport', () => {
    test('maps generated order fields to stable report values', () => {
      const report = createOrdersReport(orders());

      assert.deepEqual(report[0], {
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

    test('maps missing optional values to empty strings', () => {
      const report = createOrdersReport(orders({
        orders: [
          order({
            initialOrderPrice: undefined,
            executedOrderPrice: undefined,
            totalOrderAmount: undefined,
            averagePositionPrice: undefined,
            initialCommission: undefined,
            executedCommission: undefined,
            serviceCommission: undefined,
            orderDate: undefined,
            stages: [
              {
                price: undefined,
                quantity: 0,
                tradeId: ''
              }
            ]
          })
        ]
      }));

      assert.equal(report[0].initialOrderPrice, '');
      assert.equal(report[0].executedOrderPrice, '');
      assert.equal(report[0].totalOrderAmount, '');
      assert.equal(report[0].averagePositionPrice, '');
      assert.equal(report[0].initialCommission, '');
      assert.equal(report[0].executedCommission, '');
      assert.equal(report[0].serviceCommission, '');
      assert.equal(report[0].orderDate, '');
      assert.equal(report[0].stages[0].price, '');
    });
  });

  describe('formatOrdersReport', () => {
    test('formats report as table', () => {
      const output = formatOrdersReport(createOrdersReport(orders()), 'table');

      assert.match(output, /^orderId\s+figi\s+instrumentUid\s+status/m);
      assert.match(output, /order-id\s+BBG00QPYJ5H0\s+instrument-uid\s+EXECUTION_REPORT_STATUS_NEW/);
      assert.match(output, /ORDER_DIRECTION_BUY\s+ORDER_TYPE_LIMIT\s+10\s+2/);
      assert.match(output, /100.5 rub\s+20.25 rub\s+200 rub\s+2026-06-19T10:00:00.000Z/);
    });

    test('formats report as json', () => {
      const output = formatOrdersReport(createOrdersReport(orders()), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].orderId, 'order-id');
      assert.equal(parsed[0].status, 'EXECUTION_REPORT_STATUS_NEW');
      assert.equal(parsed[0].initialOrderPrice, '100.5 rub');
      assert.equal(parsed[0].stages[0].tradeId, 'trade-id');
    });
  });
});
