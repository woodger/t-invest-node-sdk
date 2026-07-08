import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { CancelOrderRequest } from '../../../generated/orders';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createSandboxCancelOrderCommand,
  createSandboxCancelOrderRequest,
  parseSandboxCancelOrderFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

describe('sandbox-cancel-order command', () => {
  describe('createSandboxCancelOrderRequest', () => {
    test('returns generated cancelSandboxOrder request', () => {
      assert.deepEqual(createSandboxCancelOrderRequest({
        'account-id': 'sandbox-account-id',
        'order-id': 'order-id'
      }), {
        accountId: 'sandbox-account-id',
        orderId: 'order-id'
      });
    });
  });

  describe('parseSandboxCancelOrderFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSandboxCancelOrderFormat(rawOptions()), 'table');
    });
  });

  describe('createSandboxCancelOrderCommand', () => {
    test('requires explicit confirmation before creating sdk', async () => {
      let sdkCreated = false;
      const command = createSandboxCancelOrderCommand(() => {
        sdkCreated = true;
        throw new Error('must not create sdk');
      });

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'sandbox',
            'order',
            'cancel',
            '--account-id=sandbox-account-id',
            '--order-id=order-id'
          ],
          undefined
        ),
        /Expected '--confirm' to execute side-effect command/
      );
      assert.equal(sdkCreated, false);
    });

    test('calls cancelSandboxOrder and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: CancelOrderRequest | undefined;
      let closeCalls = 0;
      const command = createSandboxCancelOrderCommand((options) => {
        receivedOptions = options;

        return {
          sandbox: {
            async cancelSandboxOrder(request) {
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
          'sandbox',
          'order',
          'cancel',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=sandbox-account-id',
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
        accountId: 'sandbox-account-id',
        orderId: 'order-id'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).time, '2026-06-19T10:00:00.000Z');
    });
  });
});
