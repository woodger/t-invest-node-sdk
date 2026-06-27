import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  PortfolioRequest_CurrencyRequest as PortfolioCurrency,
  type PortfolioRequest,
  type PortfolioResponse
} from '../../../generated/operations';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
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

const portfolioCommandName = 'operations get-portfolio';
const portfolioCommandPath = ['operations', 'get-portfolio'] as const;
const defaultPortfolioSdkFactory: PortfolioSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

const portfolioOptionsSchema = withSdkOptions(
  portfolioRequestOptionsSchema,
  portfolioFormatOptionsSchema
);

function parsePortfolioOptions(argv: CliArgs) {
  return parseCommandOptions(argv, portfolioCommandName, portfolioOptionsSchema);
}

export function parsePortfolioCurrency(argv: CliArgs): PortfolioCurrency {
  const { currency } = parseCommandOptions(
    argv,
    portfolioCommandName,
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
    portfolioCommandName,
    portfolioFormatOptionsSchema
  ).format;
}

export function createPortfolioCommand(
  createSdk: PortfolioSdkFactory = defaultPortfolioSdkFactory
) {
  return defineCommand({
    path: portfolioCommandPath,
    options: portfolioOptionsSchema,
    handle({ options }) {
      return runPortfolioCommand(options, createSdk);
    }
  });
}

export const portfolioCommand = createPortfolioCommand();

async function runPortfolioCommand(
  options: ReturnType<typeof parsePortfolioOptions>,
  createSdk: PortfolioSdkFactory
): Promise<string> {
  const request = createPortfolioRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.operations.getPortfolio(request);

    return formatPortfolio(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatPortfolio };

function createPortfolioRequest(options: ReturnType<typeof parsePortfolioOptions>): PortfolioRequest {
  return {
    accountId: options['account-id'],
    currency: portfolioCurrencies[options.currency]
  };
}
