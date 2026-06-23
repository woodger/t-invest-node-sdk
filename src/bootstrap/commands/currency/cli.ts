import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type CurrencyResponse,
  type InstrumentRequest
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentLookupArgNames,
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

const currencyArgNames = new Set([
  ...sdkOptionArgNames,
  ...instrumentLookupArgNames,
  'format'
]);

export const parseCurrencyIdType = parseInstrumentLookupIdType;
export const parseCurrencyRequest = parseInstrumentLookupRequest;

export function parseCurrencyFormat(argv: CliArgs): CurrencyFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', currencyFormats) ?? 'table';
}

export function createCurrencyCommand(
  createSdk: CurrencySdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function currency(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, currencyArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments currency-by');

    const request = parseCurrencyRequest(argv);
    const format = parseCurrencyFormat(argv);
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
