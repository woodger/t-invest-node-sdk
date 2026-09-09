/**
 * Модуль CLI-команды `instrument country list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { GetCountriesRequest, GetCountriesResponse } from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { countriesFormats, formatCountries } from './reporter';

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
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.instruments.getCountries({});

    return formatCountries(response.countries, format);
  });
}
