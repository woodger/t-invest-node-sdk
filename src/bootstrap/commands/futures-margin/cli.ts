import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetFuturesMarginRequest,
  GetFuturesMarginResponse
} from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-mechanics';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
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

const futuresMarginCommandName = 'instruments get-futures-margin';
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

function parseFuturesMarginOptions(rawOptions: CommandRawOptions) {
  return parseCommandOptions(rawOptions, futuresMarginCommandName, futuresMarginOptionsSchema);
}

export function parseFuturesMarginRequest(rawOptions: CommandRawOptions): GetFuturesMarginRequest {
  return createFuturesMarginRequest(parseFuturesMarginOptions(rawOptions));
}

export function parseFuturesMarginFormat(rawOptions: CommandRawOptions): FuturesMarginFormat {
  return parseCommandOptions(
    rawOptions,
    futuresMarginCommandName,
    futuresMarginFormatOptionsSchema
  ).format;
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
  options: ReturnType<typeof parseFuturesMarginOptions>,
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

function createFuturesMarginRequest(
  options: ReturnType<typeof parseFuturesMarginOptions>
): GetFuturesMarginRequest {
  return {
    figi: options.figi
  };
}
