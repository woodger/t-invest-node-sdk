import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type InstrumentRequest,
  type InstrumentResponse
} from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
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

const instrumentFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: instrumentFormats,
    default: 'table'
  }
} as const;

const instrumentOptionsSchema = withSdkOptions({
  ...instrumentLookupOptionsSchema,
  ...instrumentFormatOptionsSchema
} as const);

function parseInstrumentOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments get-instrument-by', instrumentOptionsSchema);
}

export const parseInstrumentIdType = parseInstrumentLookupIdType;
export const parseInstrumentRequest = parseInstrumentLookupRequest;

export function parseInstrumentFormat(argv: CliArgs): InstrumentFormat {
  return parseCommandOptions(
    argv,
    'instruments get-instrument-by',
    instrumentFormatOptionsSchema
  ).format;
}

export function createInstrumentCommand(
  createSdk: InstrumentSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function instrument(argv: CliArgs): Promise<string> {
    const { format } = parseInstrumentOptions(argv);
    const request = parseInstrumentRequest(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.getInstrumentBy(request);

      return formatInstrument(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const instrument = createInstrumentCommand();

export { formatInstrument };
