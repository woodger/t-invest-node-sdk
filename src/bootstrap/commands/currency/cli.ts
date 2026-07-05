/**
 * Модуль CLI-команды `instruments currency-by`.
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
  type CurrencyResponse,
  type InstrumentRequest
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
  instrumentLookupOptionsSchema,
  parseInstrumentLookupIdType,
} from '../../args/instruments-args';
import { currencyFormats, formatCurrency, type CurrencyFormat } from './reporter';

type CurrencySdk = {
  instruments: {
    currencyBy(request: InstrumentRequest): Promise<CurrencyResponse>;
  };
  close(): void;
};

type CurrencySdkFactory = (options: TinkoffInvestOptions) => CurrencySdk;

const currencyCommandPath = ['instruments', 'currency-by'] as const;
const defaultCurrencySdkFactory: CurrencySdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const currencyFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: currencyFormats,
    default: 'table'
  }
} as const;

const currencyOptionsSchema = withSdkOptions(
  instrumentLookupOptionsSchema,
  currencyFormatOptionsSchema
);

type CurrencyOptions = InferOptions<typeof currencyOptionsSchema>;

export const parseCurrencyIdType = parseInstrumentLookupIdType;
export const createCurrencyRequest = createInstrumentLookupRequestFromOptions;

export function parseCurrencyFormat(rawOptions: CommandRawOptions): CurrencyFormat {
  return parseCommandOptions(rawOptions, currencyFormatOptionsSchema).format;
}

export function createCurrencyCommand(
  createSdk: CurrencySdkFactory = defaultCurrencySdkFactory
) {
  return command.define({
    path: currencyCommandPath,
    options: currencyOptionsSchema,
    handle({ options }) {
      return runCurrencyCommand(options, createSdk);
    }
  });
}

export const currencyCommand = createCurrencyCommand();

async function runCurrencyCommand(
  options: CurrencyOptions,
  createSdk: CurrencySdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentLookupRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.currencyBy(request);

    return formatCurrency(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatCurrency };
