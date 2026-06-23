import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type InstrumentRequest,
  type ShareResponse
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentLookupArgNames,
  parseInstrumentLookupIdType,
  parseInstrumentLookupRequest
} from '../instruments-args';
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
  ...instrumentLookupArgNames,
  'format'
]);

export const parseShareIdType = parseInstrumentLookupIdType;
export const parseShareRequest = parseInstrumentLookupRequest;

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
