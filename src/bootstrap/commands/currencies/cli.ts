import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type CurrenciesResponse,
  type InstrumentsRequest
} from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentsRequestFromOptions,
  instrumentStatusOptionsSchema,
  parseInstrumentsRequest,
  parseInstrumentStatus
} from '../instruments-args';
import { currenciesFormats, formatCurrencies, type CurrenciesFormat } from './reporter';

type CurrenciesSdk = {
  instruments: {
    currencies(request: InstrumentsRequest): Promise<CurrenciesResponse>;
  };
  close(): void;
};

type CurrenciesSdkFactory = (options: TinkoffInvestOptions) => CurrenciesSdk;

const currenciesCommandName = 'instruments currencies';
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

function parseCurrenciesOptions(argv: CliArgs) {
  return parseCommandOptions(argv, currenciesCommandName, currenciesOptionsSchema);
}

export const parseCurrenciesInstrumentStatus = parseInstrumentStatus;
export const parseCurrenciesRequest = parseInstrumentsRequest;

export function parseCurrenciesFormat(argv: CliArgs): CurrenciesFormat {
  return parseCommandOptions(
    argv,
    currenciesCommandName,
    currenciesFormatOptionsSchema
  ).format;
}

export function createCurrenciesCommand(
  createSdk: CurrenciesSdkFactory = defaultCurrenciesSdkFactory
) {
  return defineCommand({
    path: currenciesCommandPath,
    options: currenciesOptionsSchema,
    handle({ options }) {
      return runCurrenciesCommand(options, createSdk);
    }
  });
}

export function currencies(argv: CliArgs): Promise<string> {
  return runCurrenciesCommand(
    parseCurrenciesOptions(argv),
    defaultCurrenciesSdkFactory
  );
}

export const currenciesCommand = createCurrenciesCommand();

async function runCurrenciesCommand(
  options: ReturnType<typeof parseCurrenciesOptions>,
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
