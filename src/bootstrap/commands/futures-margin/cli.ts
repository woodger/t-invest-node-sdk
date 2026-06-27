import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetFuturesMarginRequest,
  GetFuturesMarginResponse
} from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
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

function parseFuturesMarginOptions(argv: CliArgs) {
  return parseCommandOptions(argv, futuresMarginCommandName, futuresMarginOptionsSchema);
}

export function parseFuturesMarginRequest(argv: CliArgs): GetFuturesMarginRequest {
  return createFuturesMarginRequest(parseFuturesMarginOptions(argv));
}

export function parseFuturesMarginFormat(argv: CliArgs): FuturesMarginFormat {
  return parseCommandOptions(
    argv,
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

export function futuresMargin(argv: CliArgs): Promise<string> {
  return runFuturesMarginCommand(
    parseFuturesMarginOptions(argv),
    defaultFuturesMarginSdkFactory
  );
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
