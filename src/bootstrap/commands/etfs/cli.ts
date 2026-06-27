import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  EtfsResponse,
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
import { etfsFormats, formatEtfs, type EtfsFormat } from './reporter';

type EtfsSdk = {
  instruments: {
    etfs(request: InstrumentsRequest): Promise<EtfsResponse>;
  };
  close(): void;
};

type EtfsSdkFactory = (options: TinkoffInvestOptions) => EtfsSdk;

const etfsFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: etfsFormats,
    default: 'table'
  }
} as const;

const etfsOptionsSchema = withSdkOptions(
  instrumentStatusOptionsSchema,
  etfsFormatOptionsSchema
);

function parseEtfsOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments etfs', etfsOptionsSchema);
}

export const parseEtfsInstrumentStatus = parseInstrumentStatus;
export const parseEtfsRequest = parseInstrumentsRequest;

export function parseEtfsFormat(argv: CliArgs): EtfsFormat {
  return parseCommandOptions(
    argv,
    'instruments etfs',
    etfsFormatOptionsSchema
  ).format;
}

export function createEtfsCommand(
  createSdk: EtfsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function etfs(argv: CliArgs): Promise<string> {
    const { format } = parseEtfsOptions(argv);
    const request = parseEtfsRequest(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.etfs(request);

      return formatEtfs(response.instruments, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const etfs = createEtfsCommand();

export { formatEtfs };
