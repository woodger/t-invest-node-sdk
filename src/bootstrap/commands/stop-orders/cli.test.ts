import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { MoneyValue } from '../../../generated/common';
import {
  StopOrderDirection,
  StopOrderType,
  type GetStopOrdersRequest,
  type GetStopOrdersResponse,
  type StopOrder
} from '../../../generated/stoporders';
import type { CliArgs } from '../../cli-contract';
import {
  createStopOrdersCommand,
  parseStopOrdersFormat,
  parseStopOrdersRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['stoporders get-stop-orders'],
    ...args
  };
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
  };
}

function stopOrdersResponse(
  overrides: Partial<GetStopOrdersResponse> = {}
): GetStopOrdersResponse {
  return {
    stopOrders: [stopOrder()],
    ...overrides
  };
}

describe('stop-orders command', () => {
  describe('parseStopOrdersRequest', () => {
    test('returns generated getStopOrders request', () => {
      const request = parseStopOrdersRequest(argv({
        'account-id': 'account-id'
      }));

      assert.deepEqual(request, {
        accountId: 'account-id'
      });
    });
  });

  describe('parseStopOrdersFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseStopOrdersFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseStopOrdersFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createStopOrdersCommand', () => {
    test('calls getStopOrders and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
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

      const output = await runCommand(
        command,
        [
          'stoporders',
          'get-stop-orders',
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
        accountId: 'account-id'
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
        () => runCommand(
          command,
          [
            'stoporders',
            'get-stop-orders',
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
