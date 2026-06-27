import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  EtfResponse,
  InstrumentRequest
} from '../../../generated/instruments';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
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

const etfCommandName = 'instruments etf-by';
const etfCommandPath = ['instruments', 'etf-by'] as const;
const defaultEtfSdkFactory: EtfSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

type EtfOptions = InferOptions<typeof etfOptionsSchema>;

export const parseEtfIdType = parseInstrumentLookupIdType;
export const parseEtfRequest = parseInstrumentLookupRequest;

export function parseEtfFormat(argv: CliArgs): EtfFormat {
  return parseCommandOptions(
    argv,
    etfCommandName,
    etfFormatOptionsSchema
  ).format;
}

export function createEtfCommand(
  createSdk: EtfSdkFactory = defaultEtfSdkFactory
) {
  return defineCommand({
    path: etfCommandPath,
    options: etfOptionsSchema,
    handle({ options }) {
      return runEtfCommand(options, createSdk);
    }
  });
}

export const etfCommand = createEtfCommand();

async function runEtfCommand(
  options: EtfOptions,
  createSdk: EtfSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentLookupRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.etfBy(request);

    return formatEtf(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatEtf };
