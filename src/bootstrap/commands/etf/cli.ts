import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  EtfResponse,
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
import { etfFormats, formatEtf, type EtfFormat } from './reporter';

type EtfSdk = {
  instruments: {
    etfBy(request: InstrumentRequest): Promise<EtfResponse>;
  };
  close(): void;
};

type EtfSdkFactory = (options: TinkoffInvestOptions) => EtfSdk;

const etfFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: etfFormats,
    default: 'table'
  }
} as const;

const etfOptionsSchema = withSdkOptions(
  instrumentLookupOptionsSchema,
  etfFormatOptionsSchema
);

function parseEtfOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments etf-by', etfOptionsSchema);
}

export const parseEtfIdType = parseInstrumentLookupIdType;
export const parseEtfRequest = parseInstrumentLookupRequest;

export function parseEtfFormat(argv: CliArgs): EtfFormat {
  return parseCommandOptions(
    argv,
    'instruments etf-by',
    etfFormatOptionsSchema
  ).format;
}

export function createEtfCommand(
  createSdk: EtfSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function etf(argv: CliArgs): Promise<string> {
    const { format } = parseEtfOptions(argv);
    const request = parseEtfRequest(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.etfBy(request);

      return formatEtf(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const etf = createEtfCommand();

export { formatEtf };
