/**
 * Модуль CLI-команды `instruments etfs`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  EtfsResponse,
  InstrumentsRequest
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentsRequestFromOptions,
  instrumentStatusOptionsSchema,
  parseInstrumentStatus
} from '../../args/instruments-args';
import { etfsFormats, formatEtfs, type EtfsFormat } from './reporter';

type EtfsSdk = {
  instruments: {
    etfs(request: InstrumentsRequest): Promise<EtfsResponse>;
  };
  close(): void;
};

type EtfsSdkFactory = (options: TinkoffInvestOptions) => EtfsSdk;

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

type EtfsOptions = InferOptions<typeof etfsOptionsSchema>;

export const parseEtfsInstrumentStatus = parseInstrumentStatus;
export const createEtfsRequest = createInstrumentsRequestFromOptions;

export function parseEtfsFormat(rawOptions: CommandRawOptions): EtfsFormat {
  return parseCommandOptions(rawOptions, etfsFormatOptionsSchema).format;
}

export function createEtfsCommand(
  createSdk: EtfsSdkFactory = defaultEtfsSdkFactory
) {
  return command.define({
    path: etfsCommandPath,
    options: etfsOptionsSchema,
    handle({ options }) {
      return runEtfsCommand(options, createSdk);
    }
  });
}

export const etfsCommand = createEtfsCommand();

async function runEtfsCommand(
  options: EtfsOptions,
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
