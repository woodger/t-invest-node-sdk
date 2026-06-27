import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  FutureResponse,
  InstrumentRequest
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
import { formatFuture, futureFormats, type FutureFormat } from './reporter';

type FutureSdk = {
  instruments: {
    futureBy(request: InstrumentRequest): Promise<FutureResponse>;
  };
  close(): void;
};

type FutureSdkFactory = (options: TinkoffInvestOptions) => FutureSdk;

const futureCommandName = 'instruments future-by';
const futureCommandPath = ['instruments', 'future-by'] as const;
const defaultFutureSdkFactory: FutureSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const futureFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: futureFormats,
    default: 'table'
  }
} as const;

const futureOptionsSchema = withSdkOptions(
  instrumentLookupOptionsSchema,
  futureFormatOptionsSchema
);

type FutureOptions = InferOptions<typeof futureOptionsSchema>;

export const parseFutureIdType = parseInstrumentLookupIdType;
export const parseFutureRequest = parseInstrumentLookupRequest;

export function parseFutureFormat(rawOptions: CommandRawOptions): FutureFormat {
  return parseCommandOptions(
    rawOptions,
    futureCommandName,
    futureFormatOptionsSchema
  ).format;
}

export function createFutureCommand(
  createSdk: FutureSdkFactory = defaultFutureSdkFactory
) {
  return defineCommand({
    path: futureCommandPath,
    options: futureOptionsSchema,
    handle({ options }) {
      return runFutureCommand(options, createSdk);
    }
  });
}

export const futureCommand = createFutureCommand();

async function runFutureCommand(
  options: FutureOptions,
  createSdk: FutureSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentLookupRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.futureBy(request);

    return formatFuture(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatFuture };
