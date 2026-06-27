import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetFuturesMarginRequest,
  GetFuturesMarginResponse
} from '../../../generated/instruments';
import type { CommandRawOptions } from '../../command-mechanics';
import {
  createFuturesMarginCommand,
  parseFuturesMarginFormat,
  parseFuturesMarginRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function response(overrides: Partial<GetFuturesMarginResponse> = {}): GetFuturesMarginResponse {
  return {
    initialMarginOnBuy: {
      currency: 'rub',
      units: 1000,
      nano: 250_000_000
    },
    initialMarginOnSell: {
      currency: 'rub',
      units: 1100,
      nano: 0
    },
    minPriceIncrement: {
      units: 1,
      nano: 0
    },
    minPriceIncrementAmount: {
      units: 10,
      nano: 500_000_000
    },
    ...overrides
  };
}

describe('futures-margin command', () => {
  describe('parseFuturesMarginRequest', () => {
    test('returns generated getFuturesMargin request', () => {
      const request = parseFuturesMarginRequest(rawOptions({
        figi: 'FUTFIGI'
      }));

      assert.deepEqual(request, {
        figi: 'FUTFIGI'
      });
    });
  });

  describe('parseFuturesMarginFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseFuturesMarginFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseFuturesMarginFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createFuturesMarginCommand', () => {
    test('calls getFuturesMargin and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetFuturesMarginRequest | undefined;
      let getFuturesMarginCalls = 0;
      let closeCalls = 0;
      const command = createFuturesMarginCommand((options) => {
        receivedOptions = options;

        return {
          instruments: {
            async getFuturesMargin(request) {
              receivedRequest = request;
              getFuturesMarginCalls += 1;

              return response();
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
          'instruments',
          'get-futures-margin',
          '--token=token',
          '--endpoint=localhost:50051',
          '--figi=FUTFIGI',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(getFuturesMarginCalls, 1);
      assert.deepEqual(receivedRequest, {
        figi: 'FUTFIGI'
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).initialMarginOnBuy, '1000.25 rub');
    });

    test('closes sdk when getFuturesMargin rejects', async () => {
      let closeCalls = 0;
      const command = createFuturesMarginCommand(() => ({
        instruments: {
          async getFuturesMargin() {
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
            'instruments',
            'get-futures-margin',
            '--token=token',
            '--endpoint=localhost:50051',
            '--figi=FUTFIGI'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
