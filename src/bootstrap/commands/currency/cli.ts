import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type CurrencyResponse,
  type InstrumentRequest
} from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
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
  return parseCommandOptions(argv, 'instruments currency-by', currencyOptionsSchema);
}

export const parseCurrencyIdType = parseInstrumentLookupIdType;
export const parseCurrencyRequest = parseInstrumentLookupRequest;

export function parseCurrencyFormat(argv: CliArgs): CurrencyFormat {
  return parseCommandOptions(
    argv,
    'instruments currency-by',
    currencyFormatOptionsSchema
  ).format;
}

export function createCurrencyCommand(
  createSdk: CurrencySdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function currency(argv: CliArgs): Promise<string> {
    const { format } = parseCurrencyOptions(argv);
    const request = parseCurrencyRequest(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.currencyBy(request);

      return formatCurrency(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const currency = createCurrencyCommand();

export { formatCurrency };
