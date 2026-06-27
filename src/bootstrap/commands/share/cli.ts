import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type InstrumentRequest,
  type ShareResponse
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
import { formatShare, shareFormats, type ShareFormat } from './reporter';

type ShareSdk = {
  instruments: {
    shareBy(request: InstrumentRequest): Promise<ShareResponse>;
  };
  close(): void;
};

type ShareSdkFactory = (options: TinkoffInvestOptions) => ShareSdk;

const shareFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: shareFormats,
    default: 'table'
  }
} as const;

const shareOptionsSchema = withSdkOptions(
  instrumentLookupOptionsSchema,
  shareFormatOptionsSchema
);

function parseShareOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments share-by', shareOptionsSchema);
}

export const parseShareIdType = parseInstrumentLookupIdType;
export const parseShareRequest = parseInstrumentLookupRequest;

export function parseShareFormat(argv: CliArgs): ShareFormat {
  return parseCommandOptions(
    argv,
    'instruments share-by',
    shareFormatOptionsSchema
  ).format;
}

export function createShareCommand(
  createSdk: ShareSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function share(argv: CliArgs): Promise<string> {
    const { format } = parseShareOptions(argv);
    const request = parseShareRequest(argv);
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
