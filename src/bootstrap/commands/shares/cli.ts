import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type InstrumentsRequest,
  type SharesResponse
} from '../../../generated/instruments';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-mechanics';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentsRequestFromOptions,
  instrumentStatusOptionsSchema,
  parseInstrumentsRequest,
  parseInstrumentStatus
} from '../instruments-args';
import { formatShares, sharesFormats, type SharesFormat } from './reporter';

type SharesSdk = {
  instruments: {
    shares(request: InstrumentsRequest): Promise<SharesResponse>;
  };
  close(): void;
};

type SharesSdkFactory = (options: TinkoffInvestOptions) => SharesSdk;

const sharesCommandName = 'instruments shares';
const sharesCommandPath = ['instruments', 'shares'] as const;
const defaultSharesSdkFactory: SharesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const sharesFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: sharesFormats,
    default: 'table'
  }
} as const;

const sharesOptionsSchema = withSdkOptions(
  instrumentStatusOptionsSchema,
  sharesFormatOptionsSchema
);

type SharesOptions = InferOptions<typeof sharesOptionsSchema>;

export const parseSharesInstrumentStatus = parseInstrumentStatus;
export const parseSharesRequest = parseInstrumentsRequest;

export function parseSharesFormat(rawOptions: CommandRawOptions): SharesFormat {
  return parseCommandOptions(
    rawOptions,
    sharesCommandName,
    sharesFormatOptionsSchema
  ).format;
}

export function createSharesCommand(
  createSdk: SharesSdkFactory = defaultSharesSdkFactory
) {
  return defineCommand({
    path: sharesCommandPath,
    options: sharesOptionsSchema,
    handle({ options }) {
      return runSharesCommand(options, createSdk);
    }
  });
}

export const sharesCommand = createSharesCommand();

async function runSharesCommand(
  options: SharesOptions,
  createSdk: SharesSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentsRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.shares(request);

    return formatShares(response.instruments, format);
  }
  finally {
    sdk.close();
  }
}

export { formatShares };
