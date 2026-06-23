import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { InstrumentType } from '../../../generated/common';
import type { FindInstrumentRequest, FindInstrumentResponse } from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  findInstrumentFormats,
  formatFindInstrument,
  type FindInstrumentFormat
} from './reporter';

type FindInstrumentSdk = {
  instruments: {
    findInstrument(request: FindInstrumentRequest): Promise<FindInstrumentResponse>;
  };
  close(): void;
};

type FindInstrumentSdkFactory = (options: TinkoffInvestOptions) => FindInstrumentSdk;

const findInstrumentArgNames = new Set([
  ...sdkOptionArgNames,
  'query',
  'instrument-kind',
  'api-trade-available',
  'format'
]);

const instrumentKinds = {
  unspecified: InstrumentType.INSTRUMENT_TYPE_UNSPECIFIED,
  bond: InstrumentType.INSTRUMENT_TYPE_BOND,
  share: InstrumentType.INSTRUMENT_TYPE_SHARE,
  currency: InstrumentType.INSTRUMENT_TYPE_CURRENCY,
  etf: InstrumentType.INSTRUMENT_TYPE_ETF,
  futures: InstrumentType.INSTRUMENT_TYPE_FUTURES,
  sp: InstrumentType.INSTRUMENT_TYPE_SP,
  option: InstrumentType.INSTRUMENT_TYPE_OPTION,
  'clearing-certificate': InstrumentType.INSTRUMENT_TYPE_CLEARING_CERTIFICATE
} as const;

export const findInstrumentKindNames = Object.keys(instrumentKinds) as Array<keyof typeof instrumentKinds>;

type InstrumentKindName = typeof findInstrumentKindNames[number];

export function parseFindInstrumentKind(argv: CliArgs): InstrumentType {
  const instrumentKind = ArgGuards.optionalStringArgValue(argv, 'instrument-kind') ?? 'unspecified';

  if (!(instrumentKind in instrumentKinds)) {
    throw new Error(`Expected '--instrument-kind' as one of: ${findInstrumentKindNames.join(', ')}`);
  }

  return instrumentKinds[instrumentKind as InstrumentKindName];
}

export function parseFindInstrumentRequest(argv: CliArgs): FindInstrumentRequest {
  return {
    query: ArgGuards.requireStringArg(argv, 'query'),
    instrumentKind: parseFindInstrumentKind(argv),
    apiTradeAvailableFlag: ArgGuards.optionalBooleanFlagArg(argv, 'api-trade-available') ?? false
  };
}

export function parseFindInstrumentFormat(argv: CliArgs): FindInstrumentFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', findInstrumentFormats) ?? 'table';
}

export function createFindInstrumentCommand(
  createSdk: FindInstrumentSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function findInstrument(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, findInstrumentArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments find-instrument');

    const request = parseFindInstrumentRequest(argv);
    const format = parseFindInstrumentFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.findInstrument(request);

      return formatFindInstrument(response.instruments, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const findInstrument = createFindInstrumentCommand();

export { formatFindInstrument };
