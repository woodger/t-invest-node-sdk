import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetFuturesMarginRequest,
  GetFuturesMarginResponse
} from '../../../generated/instruments';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../command-options';
import { parseCommandOptions, withSdkOptions } from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  formatFuturesMargin,
  futuresMarginFormats,
  type FuturesMarginFormat
} from './reporter';

type FuturesMarginSdk = {
  instruments: {
    getFuturesMargin(request: GetFuturesMarginRequest): Promise<GetFuturesMarginResponse>;
  };
  close(): void;
};

type FuturesMarginSdkFactory = (options: TinkoffInvestOptions) => FuturesMarginSdk;

const futuresMarginCommandPath = ['instruments', 'get-futures-margin'] as const;
const defaultFuturesMarginSdkFactory: FuturesMarginSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const futuresMarginRequestOptionsSchema = {
  figi: {
    type: 'string',
    required: true
  }
} as const;

const futuresMarginFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: futuresMarginFormats,
    default: 'table'
  }
} as const;

const futuresMarginOptionsSchema = withSdkOptions(
  futuresMarginRequestOptionsSchema,
  futuresMarginFormatOptionsSchema
);

type FuturesMarginOptions = InferOptions<typeof futuresMarginOptionsSchema>;
type FuturesMarginRequestOptions = CommandRequestOptions<FuturesMarginOptions, 'figi'>;



export function parseFuturesMarginFormat(rawOptions: CommandRawOptions): FuturesMarginFormat {
  return parseCommandOptions(rawOptions, futuresMarginFormatOptionsSchema).format;
}

export function createFuturesMarginCommand(
  createSdk: FuturesMarginSdkFactory = defaultFuturesMarginSdkFactory
) {
  return defineCommand({
    path: futuresMarginCommandPath,
    options: futuresMarginOptionsSchema,
    handle({ options }) {
      return runFuturesMarginCommand(options, createSdk);
    }
  });
}

export const futuresMarginCommand = createFuturesMarginCommand();

async function runFuturesMarginCommand(
  options: FuturesMarginOptions,
  createSdk: FuturesMarginSdkFactory
): Promise<string> {
  const request = createFuturesMarginRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.getFuturesMargin(request);

    return formatFuturesMargin(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatFuturesMargin };

export function createFuturesMarginRequest(
  options: FuturesMarginRequestOptions
): GetFuturesMarginRequest {
  return {
    figi: options.figi
  };
}
