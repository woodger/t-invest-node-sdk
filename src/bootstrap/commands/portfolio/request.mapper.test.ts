import assert from 'node:assert';
import { describe, test } from 'node:test';
import { PortfolioRequest_CurrencyRequest as PortfolioCurrency } from '../../../generated/operations';
import { createPortfolioRequest } from './request.mapper';

describe('createPortfolioRequest', () => {
  test('преобразует поддерживаемые валюты в generated значения', () => {
    const cases = [
      ['rub', PortfolioCurrency.RUB],
      ['usd', PortfolioCurrency.USD],
      ['eur', PortfolioCurrency.EUR]
    ] as const;

    for (const [currency, expectedCurrency] of cases) {
      assert.deepEqual(createPortfolioRequest({
        'account-id': 'account-id',
        currency
      }), {
        accountId: 'account-id',
        currency: expectedCurrency
      });
    }
  });
});
