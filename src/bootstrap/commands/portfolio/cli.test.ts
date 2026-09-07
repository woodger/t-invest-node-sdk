import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { MoneyValue, Quotation } from '../../../generated/common';
import {
  PortfolioRequest_CurrencyRequest as PortfolioCurrency,
  type PortfolioRequest,
  type PortfolioResponse
} from '../../../generated/operations';
import { createPortfolioCommand, createPortfolioRequest } from './cli';

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

function portfolioResponse(overrides: Partial<PortfolioResponse> = {}): PortfolioResponse {
  return {
    totalAmountShares: money(1000, 0),
    totalAmountBonds: undefined,
    totalAmountEtf: undefined,
    totalAmountCurrencies: undefined,
    totalAmountFutures: undefined,
    expectedYield: quotation(1, 500000000),
    positions: [],
    accountId: 'account-id',
    totalAmountOptions: undefined,
    totalAmountSp: undefined,
    totalAmountPortfolio: money(1000, 0),
    virtualPositions: [],
    ...overrides
  } as PortfolioResponse;
}

describe('portfolio command', () => {
  describe('createPortfolioRequest', () => {
    test('returns generated getPortfolio request', () => {
      const request = createPortfolioRequest({
        'account-id': 'account-id',
        currency: 'usd'
      });

      assert.equal(request.accountId, 'account-id');
      assert.equal(request.currency, PortfolioCurrency.USD);
    });

    test('maps rub and eur currencies to generated values', () => {
      const cases = [
        ['rub', PortfolioCurrency.RUB],
        ['eur', PortfolioCurrency.EUR]
      ] as const;

      for (const [currency, expected] of cases) {
        const request = createPortfolioRequest({
          'account-id': 'account-id',
          currency
        });

        assert.equal(request.currency, expected);
      }
    });
  });

  describe('createPortfolioCommand', () => {
    test('calls getPortfolio and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: PortfolioRequest | undefined;
      let closeCalls = 0;
      const command = createPortfolioCommand((options) => {
        receivedOptions = options;

        return {
          operations: {
            async getPortfolio(request) {
              receivedRequest = request;

              return portfolioResponse();
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
          'operation',
          'portfolio',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=account-id',
          '--currency=usd',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(receivedRequest?.accountId, 'account-id');
      assert.equal(receivedRequest?.currency, PortfolioCurrency.USD);
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).summary.accountId, 'account-id');
    });

    test('closes sdk when getPortfolio rejects', async () => {
      let closeCalls = 0;
      const command = createPortfolioCommand(() => ({
        operations: {
          async getPortfolio() {
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
            'operation',
            'portfolio',
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
