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
  createSandboxOrderStateCommand,
  createSandboxOrderStateRequest,
  parseSandboxOrderStateFormat
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
    orderId: 'sandbox-order-id',
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

describe('sandbox-order-state command', () => {
  describe('createSandboxOrderStateRequest', () => {
    test('returns generated getSandboxOrderState request', () => {
      const request = createSandboxOrderStateRequest({
        'account-id': 'sandbox-account-id',
        'order-id': 'sandbox-order-id'
      });

      assert.deepEqual(request, {
        accountId: 'sandbox-account-id',
        orderId: 'sandbox-order-id'
      });
    });
  });

  describe('parseSandboxOrderStateFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSandboxOrderStateFormat(rawOptions()), 'table');
    });
  });

  describe('createSandboxOrderStateCommand', () => {
    test('calls getSandboxOrderState and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetOrderStateRequest | undefined;
      let closeCalls = 0;
      const command = createSandboxOrderStateCommand((options) => {
        receivedOptions = options;

        return {
          sandbox: {
            async getSandboxOrderState(request) {
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
          'sandbox',
          'get-sandbox-order-state',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=sandbox-account-id',
          '--order-id=sandbox-order-id',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        accountId: 'sandbox-account-id',
        orderId: 'sandbox-order-id'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).orderId, 'sandbox-order-id');
    });

    test('closes sdk when getSandboxOrderState rejects', async () => {
      let closeCalls = 0;
      const command = createSandboxOrderStateCommand(() => ({
        sandbox: {
          async getSandboxOrderState() {
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
            'sandbox',
            'get-sandbox-order-state',
            '--token=token',
            '--endpoint=localhost:50051',
            '--account-id=sandbox-account-id',
            '--order-id=sandbox-order-id'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
