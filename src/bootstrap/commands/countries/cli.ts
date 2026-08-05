/**
 * Модуль CLI-команды `instrument country list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { GetCountriesRequest, GetCountriesResponse } from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { countriesFormats, formatCountries, type CountriesFormat } from './reporter';

type CountriesSdk = {
  instruments: {
    getCountries(request: GetCountriesRequest): Promise<GetCountriesResponse>;
  };
  close(): void;
};

type CountriesSdkFactory = (options: TInvestOptions) => CountriesSdk;

const countriesCommandPath = ['instrument', 'country', 'list'] as const;
const defaultCountriesSdkFactory: CountriesSdkFactory = (options) => new TInvestNodeSDK(options);

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
