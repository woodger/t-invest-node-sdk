/**
 * Модуль хранит request mapping, общий для production и Sandbox portfolio.
 *
 * Здесь допустимы generated enum mapping и преобразование typed command
 * options.
 * Здесь не должно быть command schema, SDK calls или rendering.
 */

import {
  PortfolioRequest_CurrencyRequest as PortfolioCurrency,
  type PortfolioRequest
} from '../../../generated/operations';

interface PortfolioRequestOptions {
  readonly 'account-id': string;
  readonly currency: keyof typeof portfolioCurrencies;
}

const portfolioCurrencies = {
  rub: PortfolioCurrency.RUB,
  usd: PortfolioCurrency.USD,
  eur: PortfolioCurrency.EUR
} as const;

export function createPortfolioRequest(options: PortfolioRequestOptions): PortfolioRequest {
  return {
    accountId: options['account-id'],
    currency: portfolioCurrencies[options.currency]
  };
}
