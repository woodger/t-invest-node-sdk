import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type InstrumentRequest,
  type InstrumentResponse
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
import { formatInstrument, instrumentFormats, type InstrumentFormat } from './reporter';

type InstrumentSdk = {
  instruments: {
    getInstrumentBy(request: InstrumentRequest): Promise<InstrumentResponse>;
  };
  close(): void;
};

type InstrumentSdkFactory = (options: TinkoffInvestOptions) => InstrumentSdk;

const instrumentCommandName = 'instruments get-instrument-by';
const instrumentCommandPath = ['instruments', 'get-instrument-by'] as const;
const defaultInstrumentSdkFactory: InstrumentSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const instrumentFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: instrumentFormats,
    default: 'table'
  }
} as const;

const instrumentOptionsSchema = withSdkOptions(
  instrumentLookupOptionsSchema,
  instrumentFormatOptionsSchema
);

type InstrumentOptions = InferOptions<typeof instrumentOptionsSchema>;

export const parseInstrumentIdType = parseInstrumentLookupIdType;
export const parseInstrumentRequest = parseInstrumentLookupRequest;

export function parseInstrumentFormat(rawOptions: CommandRawOptions): InstrumentFormat {
  return parseCommandOptions(
    rawOptions,
    instrumentCommandName,
    instrumentFormatOptionsSchema
  ).format;
}

export function createInstrumentCommand(
  createSdk: InstrumentSdkFactory = defaultInstrumentSdkFactory
) {
  return defineCommand({
    path: instrumentCommandPath,
    options: instrumentOptionsSchema,
    handle({ options }) {
      return runInstrumentCommand(options, createSdk);
    }
  });
}

export const instrumentCommand = createInstrumentCommand();

async function runInstrumentCommand(
  options: InstrumentOptions,
  createSdk: InstrumentSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentLookupRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.getInstrumentBy(request);

    return formatInstrument(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatInstrument };
