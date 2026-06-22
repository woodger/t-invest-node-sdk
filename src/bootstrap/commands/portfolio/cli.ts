import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  PortfolioRequest_CurrencyRequest as PortfolioCurrency,
  type PortfolioRequest,
  type PortfolioResponse
} from '../../../generated/operations';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatPortfolio, portfolioFormats, type PortfolioFormat } from './reporter';

type PortfolioSdk = {
  operations: {
    getPortfolio(request: PortfolioRequest): Promise<PortfolioResponse>;
  };
  close(): void;
};

type PortfolioSdkFactory = (options: TinkoffInvestOptions) => PortfolioSdk;

const portfolioArgNames = new Set([
  ...sdkOptionArgNames,
  'account-id',
  'currency',
  'format'
]);

const portfolioCurrencies = {
  rub: PortfolioCurrency.RUB,
  usd: PortfolioCurrency.USD,
  eur: PortfolioCurrency.EUR
} as const;

type PortfolioCurrencyName = keyof typeof portfolioCurrencies;

export function parsePortfolioCurrency(argv: CliArgs): PortfolioCurrency {
  const currency = ArgGuards.optionalEnumArgValue(
    argv,
    'currency',
    Object.keys(portfolioCurrencies) as PortfolioCurrencyName[]
  ) ?? 'rub';

  return portfolioCurrencies[currency];
}

export function parsePortfolioRequest(argv: CliArgs): PortfolioRequest {
  return {
    accountId: ArgGuards.requireStringArg(argv, 'account-id'),
    currency: parsePortfolioCurrency(argv)
  };
}

export function parsePortfolioFormat(argv: CliArgs): PortfolioFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', portfolioFormats) ?? 'table';
}

export function createPortfolioCommand(
  createSdk: PortfolioSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function portfolio(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, portfolioArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'portfolio');

    const request = parsePortfolioRequest(argv);
    const format = parsePortfolioFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.operations.getPortfolio(request);

      return formatPortfolio(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const portfolio = createPortfolioCommand();

export { formatPortfolio };
