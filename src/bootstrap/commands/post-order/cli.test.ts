import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../command';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  OrderDirection,
  OrderExecutionReportStatus,
  OrderType,
  type PostOrderRequest,
  type PostOrderResponse
} from '../../../generated/orders';
import type { CommandRawOptions } from '../command-options';
import {
  createPostOrderCommand,
  createPostOrderRequest,
  parsePostOrderFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function postOrderResponse(overrides: Partial<PostOrderResponse> = {}): PostOrderResponse {
  return {
    orderId: 'created-order-id',
    executionReportStatus: OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_NEW,
    lotsRequested: 10,
    lotsExecuted: 0,
    initialOrderPrice: undefined,
    executedOrderPrice: undefined,
    totalOrderAmount: undefined,
    initialCommission: undefined,
    executedCommission: undefined,
    aciValue: undefined,
    figi: 'BBG00QPYJ5H0',
    direction: OrderDirection.ORDER_DIRECTION_BUY,
    initialSecurityPrice: undefined,
    orderType: OrderType.ORDER_TYPE_LIMIT,
    message: 'created',
    initialOrderPricePt: undefined,
    instrumentUid: 'instrument-uid',
    ...overrides
  };
}

describe('post-order command', () => {
  describe('createPostOrderRequest', () => {
    test('returns generated postOrder request', () => {
      const request = createPostOrderRequest({
        'account-id': 'account-id',
        'instrument-id': 'instrument-id',
        quantity: 10,
        price: '100.25',
        direction: 'buy',
        'order-type': 'limit',
        'order-id': 'idempotency-key'
      });

      assert.deepEqual(request, {
        figi: '',
        quantity: 10,
        price: {
          units: 100,
          nano: 250_000_000
        },
        direction: OrderDirection.ORDER_DIRECTION_BUY,
        accountId: 'account-id',
        orderType: OrderType.ORDER_TYPE_LIMIT,
        orderId: 'idempotency-key',
        instrumentId: 'instrument-id'
      });
    });
  });

  describe('parsePostOrderFormat', () => {
    test('returns table by default', () => {
      assert.equal(parsePostOrderFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parsePostOrderFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createPostOrderCommand', () => {
    test('requires explicit confirmation before creating sdk', async () => {
      let sdkCreated = false;
      const command = createPostOrderCommand(() => {
        sdkCreated = true;
        throw new Error('must not create sdk');
      });

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'orders',
            'post-order',
            '--account-id=account-id',
            '--instrument-id=instrument-id',
            '--quantity=10',
            '--direction=buy',
            '--order-type=market',
            '--order-id=idempotency-key'
          ],
          undefined
        ),
        /Expected '--confirm' to execute side-effect command/
      );
      assert.equal(sdkCreated, false);
    });

    test('calls postOrder and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: PostOrderRequest | undefined;
      let closeCalls = 0;
      const command = createPostOrderCommand((options) => {
        receivedOptions = options;

        return {
          orders: {
            async postOrder(request) {
              receivedRequest = request;

              return postOrderResponse();
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
          'post-order',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=account-id',
          '--instrument-id=instrument-id',
          '--quantity=10',
          '--price=100.25',
          '--direction=buy',
          '--order-type=limit',
          '--order-id=idempotency-key',
          '--confirm',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(receivedRequest?.accountId, 'account-id');
      assert.deepEqual(receivedRequest?.price, {
        units: 100,
        nano: 250_000_000
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).orderId, 'created-order-id');
    });
  });
});
