import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  InstrumentIdType,
  type InstrumentRequest,
  type ShareResponse
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatShare, shareFormats, type ShareFormat } from './reporter';

type ShareSdk = {
  instruments: {
    shareBy(request: InstrumentRequest): Promise<ShareResponse>;
  };
  close(): void;
};

type ShareSdkFactory = (options: TinkoffInvestOptions) => ShareSdk;

const shareArgNames = new Set([
  ...sdkOptionArgNames,
  'id',
  'id-type',
  'class-code',
  'format'
]);

const shareIdTypes = {
  figi: InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI,
  ticker: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
  uid: InstrumentIdType.INSTRUMENT_ID_TYPE_UID,
  'position-uid': InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID
} as const;

type ShareIdTypeName = keyof typeof shareIdTypes;

export function parseShareIdType(argv: CliArgs): InstrumentIdType {
  const idType = ArgGuards.requireStringArg(argv, 'id-type');

  if (!(idType in shareIdTypes)) {
    throw new Error(`Expected '--id-type' as one of: ${Object.keys(shareIdTypes).join(', ')}`);
  }

  return shareIdTypes[idType as ShareIdTypeName];
}

export function parseShareRequest(argv: CliArgs): InstrumentRequest {
  const idType = parseShareIdType(argv);
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

export function parseShareFormat(argv: CliArgs): ShareFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', shareFormats) ?? 'table';
}

export function createShareCommand(
  createSdk: ShareSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function share(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, shareArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments share-by');

    const request = parseShareRequest(argv);
    const format = parseShareFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.shareBy(request);

      return formatShare(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const share = createShareCommand();

export { formatShare };
