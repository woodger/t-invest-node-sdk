import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  FutureResponse,
  InstrumentRequest
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
import { formatFuture, futureFormats, type FutureFormat } from './reporter';

type FutureSdk = {
  instruments: {
    futureBy(request: InstrumentRequest): Promise<FutureResponse>;
  };
  close(): void;
};

type FutureSdkFactory = (options: TinkoffInvestOptions) => FutureSdk;

const futureFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: futureFormats,
    default: 'table'
  }
} as const;

const futureOptionsSchema = withSdkOptions({
  ...instrumentLookupOptionsSchema,
  ...futureFormatOptionsSchema
} as const);

function parseFutureOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments future-by', futureOptionsSchema);
}

export const parseFutureIdType = parseInstrumentLookupIdType;
export const parseFutureRequest = parseInstrumentLookupRequest;

export function parseFutureFormat(argv: CliArgs): FutureFormat {
  return parseCommandOptions(
    argv,
    'instruments future-by',
    futureFormatOptionsSchema
  ).format;
}

export function createFutureCommand(
  createSdk: FutureSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function future(argv: CliArgs): Promise<string> {
    const { format } = parseFutureOptions(argv);
    const request = parseFutureRequest(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.futureBy(request);

      return formatFuture(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const future = createFutureCommand();

export { formatFuture };
