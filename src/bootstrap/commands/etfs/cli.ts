import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  EtfsResponse,
  InstrumentsRequest
} from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentsRequestFromOptions,
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

const etfsCommandName = 'instruments etfs';
const etfsCommandPath = ['instruments', 'etfs'] as const;
const defaultEtfsSdkFactory: EtfsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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
  return parseCommandOptions(argv, etfsCommandName, etfsOptionsSchema);
}

export const parseEtfsInstrumentStatus = parseInstrumentStatus;
export const parseEtfsRequest = parseInstrumentsRequest;

export function parseEtfsFormat(argv: CliArgs): EtfsFormat {
  return parseCommandOptions(
    argv,
    etfsCommandName,
    etfsFormatOptionsSchema
  ).format;
}

export function createEtfsCommand(
  createSdk: EtfsSdkFactory = defaultEtfsSdkFactory
) {
  return defineCommand({
    path: etfsCommandPath,
    options: etfsOptionsSchema,
    handle({ options }) {
      return runEtfsCommand(options, createSdk);
    }
  });
}

export function etfs(argv: CliArgs): Promise<string> {
  return runEtfsCommand(
    parseEtfsOptions(argv),
    defaultEtfsSdkFactory
  );
}

export const etfsCommand = createEtfsCommand();

async function runEtfsCommand(
  options: ReturnType<typeof parseEtfsOptions>,
  createSdk: EtfsSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentsRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.etfs(request);

    return formatEtfs(response.instruments, format);
  }
  finally {
    sdk.close();
  }
}

export { formatEtfs };
