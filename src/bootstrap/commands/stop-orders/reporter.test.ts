import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { MoneyValue } from '../../../generated/common';
import {
  StopOrderDirection,
  StopOrderType,
  type GetStopOrdersResponse,
  type StopOrder
} from '../../../generated/stoporders';
import { createStopOrdersReport, formatStopOrdersReport } from './reporter';

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function stopOrder(overrides: Partial<StopOrder> = {}): StopOrder {
  return {
    stopOrderId: 'stop-order-id',
    lotsRequested: 10,
    figi: 'BBG00QPYJ5H0',
    direction: StopOrderDirection.STOP_ORDER_DIRECTION_BUY,
    currency: 'rub',
    orderType: StopOrderType.STOP_ORDER_TYPE_STOP_LOSS,
    createDate: new Date('2026-06-19T10:00:00.000Z'),
    activationDateTime: new Date('2026-06-19T10:30:00.000Z'),
    expirationTime: new Date('2026-06-20T10:00:00.000Z'),
    price: money(100, 0),
    stopPrice: money(95, 500000000),
    instrumentUid: 'instrument-uid',
    ...overrides
  } as StopOrder;
}

function response(overrides: Partial<GetStopOrdersResponse> = {}): GetStopOrdersResponse {
  return {
    stopOrders: [stopOrder()],
    ...overrides
  } as GetStopOrdersResponse;
}

describe('stop-orders reporter', () => {
  describe('createStopOrdersReport', () => {
    test('maps generated stop order fields to stable report values', () => {
      const report = createStopOrdersReport(response());

      assert.deepEqual(report[0], {
        stopOrderId: 'stop-order-id',
        lotsRequested: 10,
        figi: 'BBG00QPYJ5H0',
        instrumentUid: 'instrument-uid',
        direction: 'STOP_ORDER_DIRECTION_BUY',
        currency: 'rub',
        orderType: 'STOP_ORDER_TYPE_STOP_LOSS',
        createDate: '2026-06-19T10:00:00.000Z',
        activationDateTime: '2026-06-19T10:30:00.000Z',
        expirationTime: '2026-06-20T10:00:00.000Z',
        price: {
          currency: 'rub',
          amount: '100'
        },
        stopPrice: {
          currency: 'rub',
          amount: '95.5'
        }
      });
    });

    test('maps missing optional values to nulls and empty strings', () => {
      const report = createStopOrdersReport(response({
        stopOrders: [
          stopOrder({
            createDate: undefined,
            activationDateTime: undefined,
            expirationTime: undefined,
            price: undefined,
            stopPrice: undefined
          })
        ]
      }));

      assert.equal(report.at(0)?.createDate, '');
      assert.equal(report.at(0)?.activationDateTime, '');
      assert.equal(report.at(0)?.expirationTime, '');
      assert.equal(report.at(0)?.price, null);
      assert.equal(report.at(0)?.stopPrice, null);
    });
  });

  describe('formatStopOrdersReport', () => {
    test('formats report as table', () => {
      const output = formatStopOrdersReport(createStopOrdersReport(response()), 'table');

      assert.match(output, /^stopOrderId\s+figi\s+instrumentUid\s+direction\s+orderType/m);
      assert.match(
        output,
        /stop-order-id\s+BBG00QPYJ5H0\s+instrument-uid\s+STOP_ORDER_DIRECTION_BUY\s+STOP_ORDER_TYPE_STOP_LOSS/
      );
    });

    test('formats report as json', () => {
      const report = createStopOrdersReport(response());
      const output = formatStopOrdersReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });
  });
});
