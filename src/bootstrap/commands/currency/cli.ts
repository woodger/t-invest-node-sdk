/**
 * Модуль CLI-команды `instrument currency show`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import { type CurrencyResponse, type InstrumentRequest } from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
  instrumentLookupOptionsSchema
} from '../../args/instruments-args';
import { currencyFormats, formatCurrency } from './reporter';

type CurrencySdk = {
  instruments: {
    currencyBy(request: InstrumentRequest): Promise<CurrencyResponse>;
  };
  close(): void;
};

type CurrencySdkFactory = (options: TInvestOptions) => CurrencySdk;

const currencyCommandPath = ['instrument', 'currency', 'show'] as const;
const defaultCurrencySdkFactory: CurrencySdkFactory = (options) => new TInvestNodeSDK(options);

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
