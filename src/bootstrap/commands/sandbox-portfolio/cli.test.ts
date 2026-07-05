import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../command';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { MoneyValue, Quotation } from '../../../generated/common';
import {
  PortfolioRequest_CurrencyRequest as PortfolioCurrency,
  type PortfolioRequest,
  type PortfolioResponse
} from '../../../generated/operations';
import type { CommandRawOptions } from '../command-options';
import {
  createSandboxPortfolioCommand,
  createSandboxPortfolioRequest,
  parseSandboxPortfolioCurrency,
  parseSandboxPortfolioFormat
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

function portfolioResponse(overrides: Partial<PortfolioResponse> = {}): PortfolioResponse {
  return {
    totalAmountShares: money(1000, 0),
    totalAmountBonds: undefined,
    totalAmountEtf: undefined,
    totalAmountCurrencies: undefined,
    totalAmountFutures: undefined,
    expectedYield: quotation(1, 500000000),
    positions: [],
    accountId: 'sandbox-account-id',
    totalAmountOptions: undefined,
    totalAmountSp: undefined,
    totalAmountPortfolio: money(1000, 0),
    virtualPositions: [],
    ...overrides
  };
}

describe('sandbox-portfolio command', () => {
  describe('parseSandboxPortfolioCurrency', () => {
    test('returns rub by default', () => {
      assert.equal(parseSandboxPortfolioCurrency(rawOptions()), PortfolioCurrency.RUB);
    });
  });

  describe('createSandboxPortfolioRequest', () => {
    test('returns generated getSandboxPortfolio request', () => {
      const request = createSandboxPortfolioRequest({
        'account-id': 'sandbox-account-id',
        currency: 'usd'
      });

      assert.equal(request.accountId, 'sandbox-account-id');
      assert.equal(request.currency, PortfolioCurrency.USD);
    });
  });

  describe('parseSandboxPortfolioFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSandboxPortfolioFormat(rawOptions()), 'table');
    });
  });

  describe('createSandboxPortfolioCommand', () => {
    test('calls getSandboxPortfolio and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: PortfolioRequest | undefined;
      let closeCalls = 0;
      const command = createSandboxPortfolioCommand((options) => {
        receivedOptions = options;

        return {
          sandbox: {
            async getSandboxPortfolio(request) {
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
          'sandbox',
          'get-sandbox-portfolio',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=sandbox-account-id',
          '--currency=usd',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(receivedRequest?.accountId, 'sandbox-account-id');
      assert.equal(receivedRequest?.currency, PortfolioCurrency.USD);
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).summary.accountId, 'sandbox-account-id');
    });

    test('closes sdk when getSandboxPortfolio rejects', async () => {
      let closeCalls = 0;
      const command = createSandboxPortfolioCommand(() => ({
        sandbox: {
          async getSandboxPortfolio() {
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
            'sandbox',
            'get-sandbox-portfolio',
            '--token=token',
            '--endpoint=localhost:50051',
            '--account-id=sandbox-account-id'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
