import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { MoneyValue } from '../../../generated/common';
import {
  OrderDirection,
  OrderExecutionReportStatus,
  OrderType,
  type GetOrdersRequest,
  type GetOrdersResponse
} from '../../../generated/orders';
import { createSandboxOrdersCommand } from './cli';

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function ordersResponse(overrides: Partial<GetOrdersResponse> = {}): GetOrdersResponse {
  return {
    orders: [
      {
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
        stages: []
      }
    ],
    ...overrides
  } as GetOrdersResponse;
}

describe('sandbox-orders command', () => {
  describe('createSandboxOrdersCommand', () => {
    test('calls getSandboxOrders and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: GetOrdersRequest | undefined;
      let closeCalls = 0;
      const command = createSandboxOrdersCommand((options) => {
        receivedOptions = options;

        return {
          sandbox: {
            async getSandboxOrders(request) {
              receivedRequest = request;

              return ordersResponse();
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
          'order',
          'list',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=sandbox-account-id',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(receivedRequest?.accountId, 'sandbox-account-id');
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].orderId, 'sandbox-order-id');
    });

    test('closes sdk when getSandboxOrders rejects', async () => {
      let closeCalls = 0;
      const command = createSandboxOrdersCommand(() => ({
        sandbox: {
          async getSandboxOrders() {
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
            'order',
            'list',
            '--token=token',
            '--endpoint=localhost:50051',
            '--account-id=sandbox-account-id'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
