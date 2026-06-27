import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type CurrenciesResponse,
  type InstrumentsRequest
} from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
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
  return parseCommandOptions(argv, 'instruments currencies', currenciesOptionsSchema);
}

export const parseCurrenciesInstrumentStatus = parseInstrumentStatus;
export const parseCurrenciesRequest = parseInstrumentsRequest;

export function parseCurrenciesFormat(argv: CliArgs): CurrenciesFormat {
  return parseCommandOptions(
    argv,
    'instruments currencies',
    currenciesFormatOptionsSchema
  ).format;
}

export function createCurrenciesCommand(
  createSdk: CurrenciesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function currencies(argv: CliArgs): Promise<string> {
    const { format } = parseCurrenciesOptions(argv);
    const request = parseCurrenciesRequest(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.currencies(request);

      return formatCurrencies(response.instruments, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const currencies = createCurrenciesCommand();

export { formatCurrencies };
