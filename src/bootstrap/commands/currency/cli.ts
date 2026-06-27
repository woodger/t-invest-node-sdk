import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type CurrencyResponse,
  type InstrumentRequest
} from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
  instrumentLookupOptionsSchema,
  parseInstrumentLookupIdType,
  parseInstrumentLookupRequest
} from '../instruments-args';
import { currencyFormats, formatCurrency, type CurrencyFormat } from './reporter';

type CurrencySdk = {
  instruments: {
    currencyBy(request: InstrumentRequest): Promise<CurrencyResponse>;
  };
  close(): void;
};

type CurrencySdkFactory = (options: TinkoffInvestOptions) => CurrencySdk;

const currencyCommandName = 'instruments currency-by';
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

function parseCurrencyOptions(argv: CliArgs) {
  return parseCommandOptions(argv, currencyCommandName, currencyOptionsSchema);
}

export const parseCurrencyIdType = parseInstrumentLookupIdType;
export const parseCurrencyRequest = parseInstrumentLookupRequest;

export function parseCurrencyFormat(argv: CliArgs): CurrencyFormat {
  return parseCommandOptions(
    argv,
    currencyCommandName,
    currencyFormatOptionsSchema
  ).format;
}

export function createCurrencyCommand(
  createSdk: CurrencySdkFactory = defaultCurrencySdkFactory
) {
  return defineCommand({
    path: currencyCommandPath,
    options: currencyOptionsSchema,
    handle({ options }) {
      return runCurrencyCommand(options, createSdk);
    }
  });
}

export function currency(argv: CliArgs): Promise<string> {
  return runCurrencyCommand(
    parseCurrencyOptions(argv),
    defaultCurrencySdkFactory
  );
}

export const currencyCommand = createCurrencyCommand();

async function runCurrencyCommand(
  options: ReturnType<typeof parseCurrencyOptions>,
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
