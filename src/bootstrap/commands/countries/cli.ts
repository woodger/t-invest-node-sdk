import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetCountriesRequest, GetCountriesResponse } from '../../../generated/instruments';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-mechanics';
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

const countriesCommandPath = ['instruments', 'get-countries'] as const;
const defaultCountriesSdkFactory: CountriesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const countriesOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: countriesFormats,
    default: 'table'
  }
} as const);

type CountriesOptions = InferOptions<typeof countriesOptionsSchema>;

export function parseCountriesFormat(rawOptions: CommandRawOptions): CountriesFormat {
  return parseCommandOptions(rawOptions, countriesOptionsSchema).format;
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

export const countriesCommand = createCountriesCommand();

async function runCountriesCommand(
  options: CountriesOptions,
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
