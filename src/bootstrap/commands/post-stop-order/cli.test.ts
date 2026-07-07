import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  StopOrderDirection,
  StopOrderExpirationType,
  StopOrderType,
  type PostStopOrderRequest
} from '../../../generated/stoporders';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createPostStopOrderCommand,
  createPostStopOrderRequest,
  parsePostStopOrderFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

describe('post-stop-order command', () => {
  describe('createPostStopOrderRequest', () => {
    test('returns generated postStopOrder request', () => {
      const request = createPostStopOrderRequest({
        'account-id': 'account-id',
        'instrument-id': 'instrument-id',
        quantity: 10,
        price: '101',
        'stop-price': '95.5',
        direction: 'sell',
        'expiration-type': 'good-till-date',
        'stop-order-type': 'stop-limit',
        'expire-date': '2026-06-20T10:00:00.000Z'
      });

      assert.deepEqual(request, {
        figi: '',
        quantity: 10,
        price: {
          units: 101,
          nano: 0
        },
        stopPrice: {
          units: 95,
          nano: 500_000_000
        },
        direction: StopOrderDirection.STOP_ORDER_DIRECTION_SELL,
        accountId: 'account-id',
        expirationType: StopOrderExpirationType.STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_DATE,
        stopOrderType: StopOrderType.STOP_ORDER_TYPE_STOP_LIMIT,
        expireDate: new Date('2026-06-20T10:00:00.000Z'),
        instrumentId: 'instrument-id'
      });
    });

    test('requires expire date only for good-till-date expiration', () => {
      assert.throws(
        () => createPostStopOrderRequest({
          'account-id': 'account-id',
          'instrument-id': 'instrument-id',
          quantity: 10,
          'stop-price': '95.5',
          direction: 'sell',
          'expiration-type': 'good-till-date',
          'stop-order-type': 'stop-loss'
        }),
        /Expected '--expire-date' when '--expiration-type=good-till-date'/
      );

      assert.throws(
        () => createPostStopOrderRequest({
          'account-id': 'account-id',
          'instrument-id': 'instrument-id',
          quantity: 10,
          'stop-price': '95.5',
          direction: 'sell',
          'expiration-type': 'good-till-cancel',
          'stop-order-type': 'stop-loss',
          'expire-date': '2026-06-20T10:00:00.000Z'
        }),
        /Expected '--expire-date' only with '--expiration-type=good-till-date'/
      );
    });
  });

  describe('parsePostStopOrderFormat', () => {
    test('returns table by default', () => {
      assert.equal(parsePostStopOrderFormat(rawOptions()), 'table');
    });
  });

  describe('createPostStopOrderCommand', () => {
    test('requires explicit confirmation before creating sdk', async () => {
      let sdkCreated = false;
      const command = createPostStopOrderCommand(() => {
        sdkCreated = true;
        throw new Error('must not create sdk');
      });

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'stoporders',
            'post-stop-order',
            '--account-id=account-id',
            '--instrument-id=instrument-id',
            '--quantity=10',
            '--stop-price=95.5',
            '--direction=sell',
            '--expiration-type=good-till-cancel',
            '--stop-order-type=stop-loss'
          ],
          undefined
        ),
        /Expected '--confirm' to execute side-effect command/
      );
      assert.equal(sdkCreated, false);
    });

    test('calls postStopOrder and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: PostStopOrderRequest | undefined;
      let closeCalls = 0;
      const command = createPostStopOrderCommand((options) => {
        receivedOptions = options;

        return {
          stoporders: {
            async postStopOrder(request) {
              receivedRequest = request;

              return {
                stopOrderId: 'stop-order-id'
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
          'stoporders',
          'post-stop-order',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=account-id',
          '--instrument-id=instrument-id',
          '--quantity=10',
          '--stop-price=95.5',
          '--direction=sell',
          '--expiration-type=good-till-cancel',
          '--stop-order-type=stop-loss',
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
      assert.equal(receivedRequest?.expirationType, StopOrderExpirationType.STOP_ORDER_EXPIRATION_TYPE_GOOD_TILL_CANCEL);
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).stopOrderId, 'stop-order-id');
    });
  });
});
