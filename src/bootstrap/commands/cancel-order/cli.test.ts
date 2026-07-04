import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../command';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { CancelOrderRequest } from '../../../generated/orders';
import type { CommandRawOptions } from '../../command-options';
import {
  createCancelOrderCommand,
  createCancelOrderRequest,
  parseCancelOrderFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

describe('cancel-order command', () => {
  describe('createCancelOrderRequest', () => {
    test('returns generated cancelOrder request', () => {
      assert.deepEqual(createCancelOrderRequest({
        'account-id': 'account-id',
        'order-id': 'order-id'
      }), {
        accountId: 'account-id',
        orderId: 'order-id'
      });
    });
  });

  describe('parseCancelOrderFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseCancelOrderFormat(rawOptions()), 'table');
    });
  });

  describe('createCancelOrderCommand', () => {
    test('requires explicit confirmation before creating sdk', async () => {
      let sdkCreated = false;
      const command = createCancelOrderCommand(() => {
        sdkCreated = true;
        throw new Error('must not create sdk');
      });

      await assert.rejects(
        () => commandFacade.run(
          command,
          ['orders', 'cancel-order', '--account-id=account-id', '--order-id=order-id'],
          undefined
        ),
        /Expected '--confirm' to execute side-effect command/
      );
      assert.equal(sdkCreated, false);
    });

    test('calls cancelOrder and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: CancelOrderRequest | undefined;
      let closeCalls = 0;
      const command = createCancelOrderCommand((options) => {
        receivedOptions = options;

        return {
          orders: {
            async cancelOrder(request) {
              receivedRequest = request;

              return {
                time: new Date('2026-06-19T10:00:00.000Z')
              };
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
          'cancel-order',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=account-id',
          '--order-id=order-id',
          '--confirm',
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
      assert.equal(JSON.parse(output).time, '2026-06-19T10:00:00.000Z');
    });
  });
});
