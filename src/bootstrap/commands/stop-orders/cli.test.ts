import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { MoneyValue } from '../../../generated/common';
import {
  StopOrderDirection,
  StopOrderStatusOption,
  StopOrderType,
  type GetStopOrdersRequest,
  type GetStopOrdersResponse,
  type StopOrder
} from '../../../generated/stoporders';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createStopOrdersCommand,
  parseStopOrdersFormat,
  createStopOrdersRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function stopOrder(overrides: Partial<StopOrder> = {}): StopOrder {
  return {
    stopOrderId: 'stop-order-id',
    lotsRequested: 10,
    figi: 'BBG00QPYJ5H0',
    direction: StopOrderDirection.STOP_ORDER_DIRECTION_BUY,
    currency: 'rub',
    orderType: StopOrderType.STOP_ORDER_TYPE_STOP_LOSS,
    createDate: new Date('2026-06-19T10:00:00.000Z'),
    activationDateTime: undefined,
    expirationTime: new Date('2026-06-20T10:00:00.000Z'),
    price: money(100, 0),
    stopPrice: money(95, 500000000),
    instrumentUid: 'instrument-uid',
    ...overrides
  } as StopOrder;
}

function stopOrdersResponse(
  overrides: Partial<GetStopOrdersResponse> = {}
): GetStopOrdersResponse {
  return {
    stopOrders: [stopOrder()],
    ...overrides
  } as GetStopOrdersResponse;
}

describe('stop-orders command', () => {
  describe('createStopOrdersRequest', () => {
    test('returns generated getStopOrders request', () => {
      const request = createStopOrdersRequest({
        'account-id': 'account-id'
      });

      assert.deepEqual(request, {
        accountId: 'account-id',
        status: StopOrderStatusOption.STOP_ORDER_STATUS_UNSPECIFIED,
        from: undefined,
        to: undefined
      });
    });
  });

  describe('parseStopOrdersFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseStopOrdersFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseStopOrdersFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createStopOrdersCommand', () => {
    test('calls getStopOrders and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: GetStopOrdersRequest | undefined;
      let closeCalls = 0;
      const command = createStopOrdersCommand((options) => {
        receivedOptions = options;

        return {
          stoporders: {
            async getStopOrders(request) {
              receivedRequest = request;

              return stopOrdersResponse();
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
          'list',
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
      assert.deepEqual(receivedRequest, {
        accountId: 'account-id',
        status: StopOrderStatusOption.STOP_ORDER_STATUS_UNSPECIFIED,
        from: undefined,
        to: undefined
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].stopOrderId, 'stop-order-id');
    });

    test('closes sdk when getStopOrders rejects', async () => {
      let closeCalls = 0;
      const command = createStopOrdersCommand(() => ({
        stoporders: {
          async getStopOrders() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'stop-order',
            'list',
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
