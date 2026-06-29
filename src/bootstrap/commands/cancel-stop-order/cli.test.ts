import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { CancelStopOrderRequest } from '../../../generated/stoporders';
import type { CommandRawOptions } from '../../command-options';
import {
  createCancelStopOrderCommand,
  createCancelStopOrderRequest,
  parseCancelStopOrderFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

describe('cancel-stop-order command', () => {
  describe('createCancelStopOrderRequest', () => {
    test('returns generated cancelStopOrder request', () => {
      assert.deepEqual(createCancelStopOrderRequest({
        'account-id': 'account-id',
        'stop-order-id': 'stop-order-id'
      }), {
        accountId: 'account-id',
        stopOrderId: 'stop-order-id'
      });
    });
  });

  describe('parseCancelStopOrderFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseCancelStopOrderFormat(rawOptions()), 'table');
    });
  });

  describe('createCancelStopOrderCommand', () => {
    test('requires explicit confirmation before creating sdk', async () => {
      let sdkCreated = false;
      const command = createCancelStopOrderCommand(() => {
        sdkCreated = true;
        throw new Error('must not create sdk');
      });

      await assert.rejects(
        () => runCommand(
          command,
          [
            'stoporders',
            'cancel-stop-order',
            '--account-id=account-id',
            '--stop-order-id=stop-order-id'
          ],
          undefined
        ),
        /Expected '--confirm' to execute side-effect command/
      );
      assert.equal(sdkCreated, false);
    });

    test('calls cancelStopOrder and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: CancelStopOrderRequest | undefined;
      let closeCalls = 0;
      const command = createCancelStopOrderCommand((options) => {
        receivedOptions = options;

        return {
          stoporders: {
            async cancelStopOrder(request) {
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

      const output = await runCommand(
        command,
        [
          'stoporders',
          'cancel-stop-order',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=account-id',
          '--stop-order-id=stop-order-id',
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
        stopOrderId: 'stop-order-id'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).time, '2026-06-19T10:00:00.000Z');
    });
  });
});
