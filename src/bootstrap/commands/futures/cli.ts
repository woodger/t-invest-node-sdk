import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  FuturesResponse,
  InstrumentsRequest
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
import { formatFutures, futuresFormats, type FuturesFormat } from './reporter';

type FuturesSdk = {
  instruments: {
    futures(request: InstrumentsRequest): Promise<FuturesResponse>;
  };
  close(): void;
};

type FuturesSdkFactory = (options: TinkoffInvestOptions) => FuturesSdk;

const futuresFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: futuresFormats,
    default: 'table'
  }
} as const;

const futuresOptionsSchema = withSdkOptions(
  instrumentStatusOptionsSchema,
  futuresFormatOptionsSchema
);

function parseFuturesOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments futures', futuresOptionsSchema);
}

export const parseFuturesInstrumentStatus = parseInstrumentStatus;
export const parseFuturesRequest = parseInstrumentsRequest;

export function parseFuturesFormat(argv: CliArgs): FuturesFormat {
  return parseCommandOptions(
    argv,
    'instruments futures',
    futuresFormatOptionsSchema
  ).format;
}

export function createFuturesCommand(
  createSdk: FuturesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function futures(argv: CliArgs): Promise<string> {
    const { format } = parseFuturesOptions(argv);
    const request = parseFuturesRequest(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.futures(request);

      return formatFutures(response.instruments, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const futures = createFuturesCommand();

export { formatFutures };
