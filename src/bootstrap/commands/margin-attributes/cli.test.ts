import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { MoneyValue, Quotation } from '../../../generated/common';
import type {
  GetMarginAttributesRequest,
  GetMarginAttributesResponse
} from '../../../generated/users';
import type { CommandRawOptions } from '../../command-mechanics';
import {
  createMarginAttributesCommand,
  parseMarginAttributesFormat,
  createMarginAttributesRequest
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

function quotation(units: number, nano: number): Quotation {
  return {
    units,
    nano
  };
}

function response(
  overrides: Partial<GetMarginAttributesResponse> = {}
): GetMarginAttributesResponse {
  return {
    liquidPortfolio: money(1000, 0),
    startingMargin: money(200, 0),
    minimalMargin: money(100, 0),
    fundsSufficiencyLevel: quotation(5, 500000000),
    amountOfMissingFunds: money(0, 0),
    correctedMargin: money(250, 0),
    ...overrides
  };
}

describe('margin-attributes command', () => {
  describe('createMarginAttributesRequest', () => {
    test('returns generated getMarginAttributes request', () => {
      const request = createMarginAttributesRequest({
        'account-id': 'account-id'
      });

      assert.deepEqual(request, {
        accountId: 'account-id'
      });
    });
  });

  describe('parseMarginAttributesFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseMarginAttributesFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseMarginAttributesFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createMarginAttributesCommand', () => {
    test('calls getMarginAttributes and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetMarginAttributesRequest | undefined;
      let closeCalls = 0;
      const command = createMarginAttributesCommand((options) => {
        receivedOptions = options;

        return {
          users: {
            async getMarginAttributes(request) {
              receivedRequest = request;

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
          'users',
          'get-margin-attributes',
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
      assert.equal(JSON.parse(output).liquidPortfolio, '1000 rub');
    });

    test('closes sdk when getMarginAttributes rejects', async () => {
      let closeCalls = 0;
      const command = createMarginAttributesCommand(() => ({
        users: {
          async getMarginAttributes() {
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
            'users',
            'get-margin-attributes',
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
