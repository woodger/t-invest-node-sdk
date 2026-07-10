import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import type { MoneyValue,
  Quotation } from '../../../generated/common';
import {
  OrderDirection,
  OrderExecutionReportStatus,
  OrderType,
  type PostOrderResponse
} from '../../../generated/orders';
import { createOrderMutationReport, formatOrderMutationReport } from './reporter';

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function quotation(units: number, nano: number): Quotation {
  return {
    units,
    nano
  };
}

function postOrderResponse(overrides: Partial<PostOrderResponse> = {}): PostOrderResponse {
  return {
    orderId: 'order-id',
    executionReportStatus: OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_NEW,
    lotsRequested: 10,
    lotsExecuted: 2,
    initialOrderPrice: money(100, 0),
    executedOrderPrice: money(20, 250_000_000),
    totalOrderAmount: money(200, 0),
    initialCommission: money(1, 0),
    executedCommission: money(0, 500_000_000),
    aciValue: money(0, 100_000_000),
    figi: 'BBG00QPYJ5H0',
    direction: OrderDirection.ORDER_DIRECTION_BUY,
    initialSecurityPrice: money(10, 0),
    orderType: OrderType.ORDER_TYPE_LIMIT,
    message: 'created',
    initialOrderPricePt: quotation(100, 500_000_000),
    instrumentUid: 'instrument-uid',
    ...overrides
  } as PostOrderResponse;
}

describe('post-order reporter', () => {
  describe('createOrderMutationReport', () => {
    test('maps generated post order response to stable report values', () => {
      const report = createOrderMutationReport(postOrderResponse());

      assert.deepEqual(report, {
        orderId: 'order-id',
        status: 'EXECUTION_REPORT_STATUS_NEW',
        lotsRequested: 10,
        lotsExecuted: 2,
        initialOrderPrice: {
          currency: 'rub',
          amount: '100'
        },
        executedOrderPrice: {
          currency: 'rub',
          amount: '20.25'
        },
        totalOrderAmount: {
          currency: 'rub',
          amount: '200'
        },
        initialCommission: {
          currency: 'rub',
          amount: '1'
        },
        executedCommission: {
          currency: 'rub',
          amount: '0.5'
        },
        aciValue: {
          currency: 'rub',
          amount: '0.1'
        },
        figi: 'BBG00QPYJ5H0',
        direction: 'ORDER_DIRECTION_BUY',
        initialSecurityPrice: {
          currency: 'rub',
          amount: '10'
        },
        orderType: 'ORDER_TYPE_LIMIT',
        message: 'created',
        initialOrderPricePt: '100.5',
        instrumentUid: 'instrument-uid'
      });
    });
  });

  describe('formatOrderMutationReport', () => {
    test('formats report as table', () => {
      const output = formatOrderMutationReport(
        createOrderMutationReport(postOrderResponse()),
        'table'
      );

      assert.match(output, /^orderId\s+status\s+direction\s+orderType/m);
      assert.match(output, /order-id\s+EXECUTION_REPORT_STATUS_NEW\s+ORDER_DIRECTION_BUY/);
      assert.match(output, /100 rub\s+20.25 rub\s+200 rub/);
    });

    test('formats report as json', () => {
      const output = formatOrderMutationReport(
        createOrderMutationReport(postOrderResponse()),
        'json'
      );
      const parsed = JSON.parse(output);

      assert.equal(parsed.orderId, 'order-id');
      assert.equal(parsed.status, 'EXECUTION_REPORT_STATUS_NEW');
      assert.deepEqual(parsed.totalOrderAmount, {
        currency: 'rub',
        amount: '200'
      });
    });
  });
});
