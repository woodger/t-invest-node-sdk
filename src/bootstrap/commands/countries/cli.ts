import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetCountriesRequest, GetCountriesResponse } from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { countriesFormats, formatCountries, type CountriesFormat } from './reporter';

type CountriesSdk = {
  instruments: {
    getCountries(request: GetCountriesRequest): Promise<GetCountriesResponse>;
  };
  close(): void;
};

type CountriesSdkFactory = (options: TinkoffInvestOptions) => CountriesSdk;

const countriesCommandName = 'instruments get-countries';
const countriesCommandPath = ['instruments', 'get-countries'] as const;
const defaultCountriesSdkFactory: CountriesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const countriesOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: countriesFormats,
    default: 'table'
  }
} as const);

function parseCountriesOptions(argv: CliArgs) {
  return parseCommandOptions(argv, countriesCommandName, countriesOptionsSchema);
}

export function parseCountriesFormat(argv: CliArgs): CountriesFormat {
  return parseCountriesOptions(argv).format;
}

export function createCountriesCommand(
  createSdk: CountriesSdkFactory = defaultCountriesSdkFactory
) {
  return defineCommand({
    path: countriesCommandPath,
    options: countriesOptionsSchema,
    handle({ options }) {
      return runCountriesCommand(options, createSdk);
    }
  });
}

export function countries(argv: CliArgs): Promise<string> {
  return runCountriesCommand(
    parseCountriesOptions(argv),
    defaultCountriesSdkFactory
  );
}

export const countriesCommand = createCountriesCommand();

async function runCountriesCommand(
  options: ReturnType<typeof parseCountriesOptions>,
  createSdk: CountriesSdkFactory
): Promise<string> {
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.getCountries({});

    return formatCountries(response.countries, format);
  }
  finally {
    sdk.close();
  }
}

export { formatCountries };
