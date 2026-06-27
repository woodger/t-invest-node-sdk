import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetFuturesMarginRequest,
  GetFuturesMarginResponse
} from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
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
  return parseCommandOptions(argv, 'instruments get-futures-margin', futuresMarginOptionsSchema);
}

export function parseFuturesMarginRequest(argv: CliArgs): GetFuturesMarginRequest {
  return createFuturesMarginRequest(parseFuturesMarginOptions(argv));
}

export function parseFuturesMarginFormat(argv: CliArgs): FuturesMarginFormat {
  return parseCommandOptions(
    argv,
    'instruments get-futures-margin',
    futuresMarginFormatOptionsSchema
  ).format;
}

export function createFuturesMarginCommand(
  createSdk: FuturesMarginSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function futuresMargin(argv: CliArgs): Promise<string> {
    const options = parseFuturesMarginOptions(argv);
    const request = createFuturesMarginRequest(options);
    const { format } = options;
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.getFuturesMargin(request);

      return formatFuturesMargin(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const futuresMargin = createFuturesMarginCommand();

export { formatFuturesMargin };

function createFuturesMarginRequest(
  options: ReturnType<typeof parseFuturesMarginOptions>
): GetFuturesMarginRequest {
  return {
    figi: options.figi
  };
}
