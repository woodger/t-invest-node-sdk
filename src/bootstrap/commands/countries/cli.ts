import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetCountriesRequest, GetCountriesResponse } from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { countriesFormats, formatCountries, type CountriesFormat } from './reporter';

type CountriesSdk = {
  instruments: {
    getCountries(request: GetCountriesRequest): Promise<GetCountriesResponse>;
  };
  close(): void;
};

type CountriesSdkFactory = (options: TinkoffInvestOptions) => CountriesSdk;

const countriesArgNames = new Set([
  ...sdkOptionArgNames,
  'format'
]);

export function parseCountriesFormat(argv: CliArgs): CountriesFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', countriesFormats) ?? 'table';
}

export function createCountriesCommand(
  createSdk: CountriesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function countries(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, countriesArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments get-countries');

    const format = parseCountriesFormat(argv);
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
