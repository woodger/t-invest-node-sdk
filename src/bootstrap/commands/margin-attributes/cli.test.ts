import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { MoneyValue, Quotation } from '../../../generated/common';
import type {
  GetMarginAttributesRequest,
  GetMarginAttributesResponse
} from '../../../generated/users';
import { createMarginAttributesCommand, createMarginAttributesRequest } from './cli';

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
  } as GetMarginAttributesResponse;
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

  describe('createMarginAttributesCommand', () => {
    test('calls getMarginAttributes and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
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

      const output = await commandFacade.run(
        command,
        [
          'account',
          'margin',
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
      assert.deepEqual(JSON.parse(output).liquidPortfolio, {
        currency: 'rub',
        amount: '1000'
      });
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
        () => commandFacade.run(
          command,
          [
            'account',
            'margin',
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
