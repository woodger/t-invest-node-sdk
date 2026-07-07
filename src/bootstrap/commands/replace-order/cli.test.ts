import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  OrderDirection,
  OrderExecutionReportStatus,
  OrderType,
  PriceType,
  type PostOrderResponse,
  type ReplaceOrderRequest
} from '../../../generated/orders';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createReplaceOrderCommand,
  createReplaceOrderRequest,
  parseReplaceOrderFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function replaceOrderResponse(overrides: Partial<PostOrderResponse> = {}): PostOrderResponse {
  return {
    orderId: 'replaced-order-id',
    executionReportStatus: OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_NEW,
    lotsRequested: 5,
    lotsExecuted: 0,
    initialOrderPrice: undefined,
    executedOrderPrice: undefined,
    totalOrderAmount: undefined,
    initialCommission: undefined,
    executedCommission: undefined,
    aciValue: undefined,
    figi: 'BBG00QPYJ5H0',
    direction: OrderDirection.ORDER_DIRECTION_SELL,
    initialSecurityPrice: undefined,
    orderType: OrderType.ORDER_TYPE_LIMIT,
    message: 'replaced',
    initialOrderPricePt: undefined,
    instrumentUid: 'instrument-uid',
    ...overrides
  };
}

describe('replace-order command', () => {
  describe('createReplaceOrderRequest', () => {
    test('returns generated replaceOrder request', () => {
      const request = createReplaceOrderRequest({
        'account-id': 'account-id',
        'order-id': 'order-id',
        'idempotency-key': 'new-idempotency-key',
        quantity: 5,
        price: '101.5',
        'price-type': 'currency'
      });

      assert.deepEqual(request, {
        accountId: 'account-id',
        orderId: 'order-id',
        idempotencyKey: 'new-idempotency-key',
        quantity: 5,
        price: {
          units: 101,
          nano: 500_000_000
        },
        priceType: PriceType.PRICE_TYPE_CURRENCY
      });
    });
  });

  describe('parseReplaceOrderFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseReplaceOrderFormat(rawOptions()), 'table');
    });
  });

  describe('createReplaceOrderCommand', () => {
    test('requires explicit confirmation before creating sdk', async () => {
      let sdkCreated = false;
      const command = createReplaceOrderCommand(() => {
        sdkCreated = true;
        throw new Error('must not create sdk');
      });

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'orders',
            'replace-order',
            '--account-id=account-id',
            '--order-id=order-id',
            '--idempotency-key=new-idempotency-key',
            '--quantity=5',
            '--price=101.5',
            '--price-type=currency'
          ],
          undefined
        ),
        /Expected '--confirm' to execute side-effect command/
      );
      assert.equal(sdkCreated, false);
    });

    test('calls replaceOrder and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: ReplaceOrderRequest | undefined;
      let closeCalls = 0;
      const command = createReplaceOrderCommand((options) => {
        receivedOptions = options;

        return {
          orders: {
            async replaceOrder(request) {
              receivedRequest = request;

              return replaceOrderResponse();
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
          'replace-order',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=account-id',
          '--order-id=order-id',
          '--idempotency-key=new-idempotency-key',
          '--quantity=5',
          '--price=101.5',
          '--price-type=currency',
          '--confirm',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(receivedRequest?.idempotencyKey, 'new-idempotency-key');
      assert.equal(receivedRequest?.priceType, PriceType.PRICE_TYPE_CURRENCY);
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).orderId, 'replaced-order-id');
    });
  });
});
