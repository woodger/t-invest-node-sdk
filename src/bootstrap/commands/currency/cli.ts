import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentIdType,
  type CurrencyResponse,
  type InstrumentRequest
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
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
  'id',
  'id-type',
  'class-code',
  'format'
]);

const currencyIdTypes = {
  figi: InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI,
  ticker: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
  uid: InstrumentIdType.INSTRUMENT_ID_TYPE_UID,
  'position-uid': InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID
} as const;

type CurrencyIdTypeName = keyof typeof currencyIdTypes;

export function parseCurrencyIdType(argv: CliArgs): InstrumentIdType {
  const idType = ArgGuards.requireStringArg(argv, 'id-type');

  if (!(idType in currencyIdTypes)) {
    throw new Error(`Expected '--id-type' as one of: ${Object.keys(currencyIdTypes).join(', ')}`);
  }

  return currencyIdTypes[idType as CurrencyIdTypeName];
}

export function parseCurrencyRequest(argv: CliArgs): InstrumentRequest {
  const idType = parseCurrencyIdType(argv);
  const classCode = ArgGuards.optionalStringArgValue(argv, 'class-code') ?? '';

  if (idType === InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER && classCode === '') {
    throw new Error("Expected required argument '--class-code' when '--id-type=ticker'");
  }

  return {
    id: ArgGuards.requireStringArg(argv, 'id'),
    idType,
    classCode
  };
}

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
