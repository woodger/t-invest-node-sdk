import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { MoneyValue, Quotation } from '../../../generated/common';
import {
  PortfolioRequest_CurrencyRequest as PortfolioCurrency,
  type PortfolioRequest,
  type PortfolioResponse
} from '../../../generated/operations';
import type { CliArgs } from '../../cli-contract';
import {
  createPortfolioCommand,
  parsePortfolioCurrency,
  parsePortfolioFormat,
  parsePortfolioRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['operations get-portfolio'],
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
  };
}

describe('portfolio command', () => {
  describe('parsePortfolioCurrency', () => {
    test('returns rub by default', () => {
      assert.equal(parsePortfolioCurrency(argv()), PortfolioCurrency.RUB);
    });

    test('maps public currency names to generated enum values', () => {
      assert.equal(parsePortfolioCurrency(argv({ currency: 'usd' })), PortfolioCurrency.USD);
      assert.equal(parsePortfolioCurrency(argv({ currency: 'eur' })), PortfolioCurrency.EUR);
    });

    test('rejects unknown currencies', () => {
      assert.throws(
        () => parsePortfolioCurrency(argv({ currency: 'gbp' })),
        /Expected '--currency' as one of: rub, usd, eur/
      );
    });
  });

  describe('parsePortfolioRequest', () => {
    test('returns generated getPortfolio request', () => {
      const request = parsePortfolioRequest(argv({
        'account-id': 'account-id',
        currency: 'usd'
      }));

      assert.equal(request.accountId, 'account-id');
      assert.equal(request.currency, PortfolioCurrency.USD);
    });
  });

  describe('parsePortfolioFormat', () => {
    test('returns table by default', () => {
      assert.equal(parsePortfolioFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parsePortfolioFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createPortfolioCommand', () => {
    test('calls getPortfolio and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
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

      const output = await runCommand(
        command,
        [
          'operations',
          'get-portfolio',
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
        () => runCommand(
          command,
          [
            'operations',
            'get-portfolio',
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
