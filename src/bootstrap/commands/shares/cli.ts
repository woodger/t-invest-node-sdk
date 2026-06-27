import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type InstrumentsRequest,
  type SharesResponse
} from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
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

function parseSharesOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments shares', sharesOptionsSchema);
}

export const parseSharesInstrumentStatus = parseInstrumentStatus;
export const parseSharesRequest = parseInstrumentsRequest;

export function parseSharesFormat(argv: CliArgs): SharesFormat {
  return parseCommandOptions(
    argv,
    'instruments shares',
    sharesFormatOptionsSchema
  ).format;
}

export function createSharesCommand(
  createSdk: SharesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function shares(argv: CliArgs): Promise<string> {
    const { format } = parseSharesOptions(argv);
    const request = parseSharesRequest(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.shares(request);

      return formatShares(response.instruments, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const shares = createSharesCommand();

export { formatShares };
