import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type CurrenciesResponse,
  type InstrumentsRequest
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentStatusArgNames,
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

const currenciesArgNames = new Set([
  ...sdkOptionArgNames,
  ...instrumentStatusArgNames,
  'format'
]);

export const parseCurrenciesInstrumentStatus = parseInstrumentStatus;
export const parseCurrenciesRequest = parseInstrumentsRequest;

export function parseCurrenciesFormat(argv: CliArgs): CurrenciesFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', currenciesFormats) ?? 'table';
}

export function createCurrenciesCommand(
  createSdk: CurrenciesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function currencies(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, currenciesArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments currencies');

    const request = parseCurrenciesRequest(argv);
    const format = parseCurrenciesFormat(argv);
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
