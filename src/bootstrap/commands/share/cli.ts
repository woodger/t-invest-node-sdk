import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type InstrumentRequest,
  type ShareResponse
} from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
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

function parseShareOptions(argv: CliArgs) {
  return parseCommandOptions(argv, shareCommandName, shareOptionsSchema);
}

export const parseShareIdType = parseInstrumentLookupIdType;
export const parseShareRequest = parseInstrumentLookupRequest;

export function parseShareFormat(argv: CliArgs): ShareFormat {
  return parseCommandOptions(
    argv,
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

export function share(argv: CliArgs): Promise<string> {
  return runShareCommand(
    parseShareOptions(argv),
    defaultShareSdkFactory
  );
}

export const shareCommand = createShareCommand();

async function runShareCommand(
  options: ReturnType<typeof parseShareOptions>,
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
