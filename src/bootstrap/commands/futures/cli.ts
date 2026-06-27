import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  FuturesResponse,
  InstrumentsRequest
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
import { formatFutures, futuresFormats, type FuturesFormat } from './reporter';

type FuturesSdk = {
  instruments: {
    futures(request: InstrumentsRequest): Promise<FuturesResponse>;
  };
  close(): void;
};

type FuturesSdkFactory = (options: TinkoffInvestOptions) => FuturesSdk;

const futuresCommandName = 'instruments futures';
const futuresCommandPath = ['instruments', 'futures'] as const;
const defaultFuturesSdkFactory: FuturesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

type FuturesOptions = InferOptions<typeof futuresOptionsSchema>;

export const parseFuturesInstrumentStatus = parseInstrumentStatus;
export const parseFuturesRequest = parseInstrumentsRequest;

export function parseFuturesFormat(rawOptions: CommandRawOptions): FuturesFormat {
  return parseCommandOptions(
    rawOptions,
    futuresCommandName,
    futuresFormatOptionsSchema
  ).format;
}

export function createFuturesCommand(
  createSdk: FuturesSdkFactory = defaultFuturesSdkFactory
) {
  return defineCommand({
    path: futuresCommandPath,
    options: futuresOptionsSchema,
    handle({ options }) {
      return runFuturesCommand(options, createSdk);
    }
  });
}

export const futuresCommand = createFuturesCommand();

async function runFuturesCommand(
  options: FuturesOptions,
  createSdk: FuturesSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentsRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.futures(request);

    return formatFutures(response.instruments, format);
  }
  finally {
    sdk.close();
  }
}

export { formatFutures };
