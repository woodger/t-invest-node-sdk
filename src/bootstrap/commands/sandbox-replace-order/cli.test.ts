import assert from 'node:assert';
import {
  describe,
  test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  OrderDirection,
  OrderExecutionReportStatus,
  OrderType,
  type PostOrderResponse,
  type ReplaceOrderRequest
} from '../../../generated/orders';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createSandboxReplaceOrderCommand,
  parseSandboxReplaceOrderFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function replaceOrderResponse(overrides: Partial<PostOrderResponse> = {}): PostOrderResponse {
  return {
    orderId: 'sandbox-replaced-order-id',
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
  } as PostOrderResponse;
}

describe('sandbox-replace-order command', () => {
  describe('parseSandboxReplaceOrderFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSandboxReplaceOrderFormat(rawOptions()), 'table');
    });
  });

  describe('createSandboxReplaceOrderCommand', () => {
    test('requires explicit confirmation before creating sdk', async () => {
      let sdkCreated = false;
      const command = createSandboxReplaceOrderCommand(() => {
        sdkCreated = true;
        throw new Error('must not create sdk');
      });

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'sandbox',
            'order',
            'replace',
            '--account-id=sandbox-account-id',
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

    test('calls replaceSandboxOrder and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: ReplaceOrderRequest | undefined;
      let closeCalls = 0;
      const command = createSandboxReplaceOrderCommand((options) => {
        receivedOptions = options;

        return {
          sandbox: {
            async replaceSandboxOrder(request) {
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
          'sandbox',
          'order',
          'replace',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=sandbox-account-id',
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
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).orderId, 'sandbox-replaced-order-id');
    });
  });
});
