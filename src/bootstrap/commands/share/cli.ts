import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type InstrumentRequest,
  type ShareResponse
} from '../../../generated/instruments';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-mechanics';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
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

const shareCommandName = 'instruments share-by';
const shareCommandPath = ['instruments', 'share-by'] as const;
const defaultShareSdkFactory: ShareSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

type ShareOptions = InferOptions<typeof shareOptionsSchema>;

export const parseShareIdType = parseInstrumentLookupIdType;
export const parseShareRequest = parseInstrumentLookupRequest;

export function parseShareFormat(rawOptions: CommandRawOptions): ShareFormat {
  return parseCommandOptions(
    rawOptions,
    shareCommandName,
    shareFormatOptionsSchema
  ).format;
}

export function createShareCommand(
  createSdk: ShareSdkFactory = defaultShareSdkFactory
) {
  return defineCommand({
    path: shareCommandPath,
    options: shareOptionsSchema,
    handle({ options }) {
      return runShareCommand(options, createSdk);
    }
  });
}

export const shareCommand = createShareCommand();

async function runShareCommand(
  options: ShareOptions,
  createSdk: ShareSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentLookupRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.shareBy(request);

    return formatShare(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatShare };
