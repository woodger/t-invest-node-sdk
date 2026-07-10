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
  type PostOrderRequest,
  type PostOrderResponse
} from '../../../generated/orders';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createSandboxPostOrderCommand,
  createSandboxPostOrderRequest,
  parseSandboxPostOrderFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function postOrderResponse(overrides: Partial<PostOrderResponse> = {}): PostOrderResponse {
  return {
    orderId: 'sandbox-created-order-id',
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
  } as PostOrderResponse;
}

describe('sandbox-post-order command', () => {
  describe('createSandboxPostOrderRequest', () => {
    test('returns generated postSandboxOrder request', () => {
      const request = createSandboxPostOrderRequest({
        'account-id': 'sandbox-account-id',
        'instrument-id': 'instrument-id',
        quantity: 10,
        price: '100.25',
        direction: 'buy',
        'order-type': 'limit',
        'order-id': 'idempotency-key'
      });

      assert.equal(request.accountId, 'sandbox-account-id');
      assert.equal(request.instrumentId, 'instrument-id');
      assert.deepEqual(request.price, {
        units: 100,
        nano: 250_000_000
      });
    });
  });

  describe('parseSandboxPostOrderFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSandboxPostOrderFormat(rawOptions()), 'table');
    });
  });

  describe('createSandboxPostOrderCommand', () => {
    test('requires explicit confirmation before creating sdk', async () => {
      let sdkCreated = false;
      const command = createSandboxPostOrderCommand(() => {
        sdkCreated = true;
        throw new Error('must not create sdk');
      });

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'sandbox',
            'order',
            'place',
            '--account-id=sandbox-account-id',
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

    test('calls postSandboxOrder and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: PostOrderRequest | undefined;
      let closeCalls = 0;
      const command = createSandboxPostOrderCommand((options) => {
        receivedOptions = options;

        return {
          sandbox: {
            async postSandboxOrder(request) {
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
          'sandbox',
          'order',
          'place',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=sandbox-account-id',
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
      assert.equal(receivedRequest?.accountId, 'sandbox-account-id');
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).orderId, 'sandbox-created-order-id');
    });
  });
});
