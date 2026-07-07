import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { MoneyValue } from '../../../generated/common';
import {
  OrderDirection,
  OrderExecutionReportStatus,
  OrderType,
  type GetOrderStateRequest,
  type OrderState
} from '../../../generated/orders';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createOrderStateCommand,
  parseOrderStateFormat,
  createOrderStateRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

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
    initialOrderPrice: money(100, 0),
    executedOrderPrice: undefined,
    totalOrderAmount: undefined,
    averagePositionPrice: undefined,
    initialCommission: undefined,
    executedCommission: undefined,
    initialSecurityPrice: undefined,
    serviceCommission: undefined,
    currency: 'rub',
    orderDate: new Date('2026-06-19T10:00:00.000Z'),
    stages: [],
    ...overrides
  };
}

describe('order-state command', () => {
  describe('createOrderStateRequest', () => {
    test('returns generated getOrderState request', () => {
      const request = createOrderStateRequest({
        'account-id': 'account-id',
        'order-id': 'order-id'
      });

      assert.deepEqual(request, {
        accountId: 'account-id',
        orderId: 'order-id'
      });
    });
  });

  describe('parseOrderStateFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseOrderStateFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseOrderStateFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createOrderStateCommand', () => {
    test('calls getOrderState and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetOrderStateRequest | undefined;
      let closeCalls = 0;
      const command = createOrderStateCommand((options) => {
        receivedOptions = options;

        return {
          orders: {
            async getOrderState(request) {
              receivedRequest = request;

              return orderState();
            }
          },
          close() {
            closeCalls += 1;
          }
        };
      });

      const output = await commandFacade.run(
        command,
        [
          'orders',
          'get-order-state',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=account-id',
          '--order-id=order-id',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        accountId: 'account-id',
        orderId: 'order-id'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).orderId, 'order-id');
    });

    test('closes sdk when getOrderState rejects', async () => {
      let closeCalls = 0;
      const command = createOrderStateCommand(() => ({
        orders: {
          async getOrderState() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'orders',
            'get-order-state',
            '--token=token',
            '--endpoint=localhost:50051',
            '--account-id=account-id',
            '--order-id=order-id'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
