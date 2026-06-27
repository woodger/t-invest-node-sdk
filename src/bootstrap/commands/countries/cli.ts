import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetCountriesRequest, GetCountriesResponse } from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
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

const countriesOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: countriesFormats,
    default: 'table'
  }
} as const);

function parseCountriesOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments get-countries', countriesOptionsSchema);
}

export function parseCountriesFormat(argv: CliArgs): CountriesFormat {
  return parseCountriesOptions(argv).format;
}

export function createCountriesCommand(
  createSdk: CountriesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function countries(argv: CliArgs): Promise<string> {
    const { format } = parseCountriesOptions(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.getCountries({});

      return formatCountries(response.countries, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const countries = createCountriesCommand();

export { formatCountries };
