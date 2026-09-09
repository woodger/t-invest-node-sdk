import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { CancelStopOrderRequest } from '../../../generated/stoporders';
import { createCancelStopOrderCommand, createCancelStopOrderRequest } from './cli';

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

  describe('createCancelStopOrderCommand', () => {
    test('requires explicit confirmation before creating sdk', async () => {
      let sdkCreated = false;
      const command = createCancelStopOrderCommand(() => {
        sdkCreated = true;
        throw new Error('must not create sdk');
      });

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'stop-order',
            'cancel',
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
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: CancelStopOrderRequest | undefined;
      let closeCalls = 0;
      const command = createCancelStopOrderCommand((options) => {
        receivedOptions = options;

        return {
    stopOrders: {
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

      const output = await commandFacade.run(
        command,
        [
          'stop-order',
          'cancel',
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
