import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  PortfolioRequest_CurrencyRequest as PortfolioCurrency,
  type PortfolioRequest,
  type PortfolioResponse
} from '../../../generated/operations';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatPortfolio, portfolioFormats, type PortfolioFormat } from './reporter';

type PortfolioSdk = {
  operations: {
    getPortfolio(request: PortfolioRequest): Promise<PortfolioResponse>;
  };
  close(): void;
};

type PortfolioSdkFactory = (options: TinkoffInvestOptions) => PortfolioSdk;

const portfolioCurrencies = {
  rub: PortfolioCurrency.RUB,
  usd: PortfolioCurrency.USD,
  eur: PortfolioCurrency.EUR
} as const;

type PortfolioCurrencyName = keyof typeof portfolioCurrencies;

const portfolioCurrencyNames = Object.keys(portfolioCurrencies) as PortfolioCurrencyName[];

const portfolioRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  currency: {
    type: 'string',
    choices: portfolioCurrencyNames,
    default: 'rub'
  }
} as const;

const portfolioFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: portfolioFormats,
    default: 'table'
  }
} as const;

const portfolioOptionsSchema = withSdkOptions({
  ...portfolioRequestOptionsSchema,
  ...portfolioFormatOptionsSchema
} as const);

function parsePortfolioOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'operations get-portfolio', portfolioOptionsSchema);
}

export function parsePortfolioCurrency(argv: CliArgs): PortfolioCurrency {
  const { currency } = parseCommandOptions(
    argv,
    'operations get-portfolio',
    { currency: portfolioRequestOptionsSchema.currency } as const
  );

  return portfolioCurrencies[currency];
}

export function parsePortfolioRequest(argv: CliArgs): PortfolioRequest {
  return createPortfolioRequest(parsePortfolioOptions(argv));
}

export function parsePortfolioFormat(argv: CliArgs): PortfolioFormat {
  return parseCommandOptions(
    argv,
    'operations get-portfolio',
    portfolioFormatOptionsSchema
  ).format;
}

export function createPortfolioCommand(
  createSdk: PortfolioSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function portfolio(argv: CliArgs): Promise<string> {
    const options = parsePortfolioOptions(argv);
    const request = createPortfolioRequest(options);
    const { format } = options;
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

function createPortfolioRequest(options: ReturnType<typeof parsePortfolioOptions>): PortfolioRequest {
  return {
    accountId: options['account-id'],
    currency: portfolioCurrencies[options.currency]
  };
}
