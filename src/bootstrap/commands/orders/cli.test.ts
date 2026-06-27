import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { MoneyValue } from '../../../generated/common';
import {
  OrderDirection,
  OrderExecutionReportStatus,
  OrderType,
  type GetOrdersRequest,
  type GetOrdersResponse
} from '../../../generated/orders';
import type { CliArgs } from '../../cli-contract';
import {
  createOrdersCommand,
  parseOrdersFormat,
  parseOrdersRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['orders get-orders'],
    ...args
  };
}

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
        stages: []
      }
    ],
    ...overrides
  };
}

describe('orders command', () => {
  describe('parseOrdersRequest', () => {
    test('returns generated getOrders request', () => {
      const request = parseOrdersRequest(argv({
        'account-id': 'account-id'
      }));

      assert.equal(request.accountId, 'account-id');
    });
  });

  describe('parseOrdersFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseOrdersFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseOrdersFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createOrdersCommand', () => {
    test('calls getOrders and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetOrdersRequest | undefined;
      let closeCalls = 0;
      const command = createOrdersCommand((options) => {
        receivedOptions = options;

        return {
          orders: {
            async getOrders(request) {
              receivedRequest = request;

              return ordersResponse();
            }
          },
          close() {
            closeCalls += 1;
          }
        };
      });

      const output = await runCommand(
        command,
        [
          'orders',
          'get-orders',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=account-id',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(receivedRequest?.accountId, 'account-id');
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].orderId, 'order-id');
    });

    test('closes sdk when getOrders rejects', async () => {
      let closeCalls = 0;
      const command = createOrdersCommand(() => ({
        orders: {
          async getOrders() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => runCommand(
          command,
          [
            'orders',
            'get-orders',
            '--token=token',
            '--endpoint=localhost:50051',
            '--account-id=account-id'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
