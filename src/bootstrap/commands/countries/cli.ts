/**
 * Модуль CLI-команды `instruments get-countries`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetCountriesRequest, GetCountriesResponse } from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
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
  return command.define({
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
