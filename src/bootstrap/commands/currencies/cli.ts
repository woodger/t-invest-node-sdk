/**
 * Модуль CLI-команды `instruments currencies`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type CurrenciesResponse,
  type InstrumentsRequest
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentsRequestFromOptions,
  instrumentStatusOptionsSchema,
  parseInstrumentStatus
} from '../../args/instruments-args';
import { currenciesFormats, formatCurrencies, type CurrenciesFormat } from './reporter';

type CurrenciesSdk = {
  instruments: {
    currencies(request: InstrumentsRequest): Promise<CurrenciesResponse>;
  };
  close(): void;
};

type CurrenciesSdkFactory = (options: TinkoffInvestOptions) => CurrenciesSdk;

const currenciesCommandPath = ['instruments', 'currencies'] as const;
const defaultCurrenciesSdkFactory: CurrenciesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const currenciesFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: currenciesFormats,
    default: 'table'
  }
} as const;

const currenciesOptionsSchema = withSdkOptions(
  instrumentStatusOptionsSchema,
  currenciesFormatOptionsSchema
);

type CurrenciesOptions = InferOptions<typeof currenciesOptionsSchema>;

export const parseCurrenciesInstrumentStatus = parseInstrumentStatus;
export const createCurrenciesRequest = createInstrumentsRequestFromOptions;

export function parseCurrenciesFormat(rawOptions: CommandRawOptions): CurrenciesFormat {
  return parseCommandOptions(rawOptions, currenciesFormatOptionsSchema).format;
}

export function createCurrenciesCommand(
  createSdk: CurrenciesSdkFactory = defaultCurrenciesSdkFactory
) {
  return command.define({
    path: currenciesCommandPath,
    options: currenciesOptionsSchema,
    handle({ options }) {
      return runCurrenciesCommand(options, createSdk);
    }
  });
}

export const currenciesCommand = createCurrenciesCommand();

async function runCurrenciesCommand(
  options: CurrenciesOptions,
  createSdk: CurrenciesSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentsRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.currencies(request);

    return formatCurrencies(response.instruments, format);
  }
  finally {
    sdk.close();
  }
}

export { formatCurrencies };
