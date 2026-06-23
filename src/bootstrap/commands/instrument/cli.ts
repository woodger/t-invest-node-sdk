import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentIdType,
  type InstrumentRequest,
  type InstrumentResponse
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatInstrument, instrumentFormats, type InstrumentFormat } from './reporter';

type InstrumentSdk = {
  instruments: {
    getInstrumentBy(request: InstrumentRequest): Promise<InstrumentResponse>;
  };
  close(): void;
};

type InstrumentSdkFactory = (options: TinkoffInvestOptions) => InstrumentSdk;

const instrumentArgNames = new Set([
  ...sdkOptionArgNames,
  'id',
  'id-type',
  'class-code',
  'format'
]);

const instrumentIdTypes = {
  figi: InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI,
  ticker: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
  uid: InstrumentIdType.INSTRUMENT_ID_TYPE_UID,
  'position-uid': InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID
} as const;

type InstrumentIdTypeName = keyof typeof instrumentIdTypes;

export function parseInstrumentIdType(argv: CliArgs): InstrumentIdType {
  const idType = ArgGuards.requireStringArg(argv, 'id-type');

  if (!(idType in instrumentIdTypes)) {
    throw new Error(`Expected '--id-type' as one of: ${Object.keys(instrumentIdTypes).join(', ')}`);
  }

  return instrumentIdTypes[idType as InstrumentIdTypeName];
}

export function parseInstrumentRequest(argv: CliArgs): InstrumentRequest {
  const idType = parseInstrumentIdType(argv);
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

export function parseInstrumentFormat(argv: CliArgs): InstrumentFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', instrumentFormats) ?? 'table';
}

export function createInstrumentCommand(
  createSdk: InstrumentSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function instrument(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, instrumentArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instrument');

    const request = parseInstrumentRequest(argv);
    const format = parseInstrumentFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.getInstrumentBy(request);

      return formatInstrument(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const instrument = createInstrumentCommand();

export { formatInstrument };
