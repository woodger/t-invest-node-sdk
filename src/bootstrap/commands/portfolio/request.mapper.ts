/**
 * Модуль хранит request mapping, общий для production и Sandbox portfolio.
 *
 * Здесь допустимы generated enum mapping и преобразование typed command options.
 * Здесь не должно быть command schema, SDK calls или rendering.
 */

import {
  PortfolioRequest_CurrencyRequest as PortfolioCurrency,
  type PortfolioRequest
} from '../../../generated/operations';

const portfolioCurrencies = {
  rub: PortfolioCurrency.RUB,
  usd: PortfolioCurrency.USD,
  eur: PortfolioCurrency.EUR
} as const;

interface PortfolioRequestOptions {
  readonly 'account-id': string;
  readonly currency: keyof typeof portfolioCurrencies;
}

export function createPortfolioRequest(
  options: PortfolioRequestOptions
): PortfolioRequest {
  return {
    accountId: options['account-id'],
    currency: portfolioCurrencies[options.currency]
  };
}
