/**
 * Модуль CLI-команды `instrument etf show`.
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
  EtfResponse,
  InstrumentRequest
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
  instrumentLookupOptionsSchema
} from '../../args/instruments-args';
import { etfFormats, formatEtf, type EtfFormat } from './reporter';

type EtfSdk = {
  instruments: {
    etfBy(request: InstrumentRequest): Promise<EtfResponse>;
  };
  close(): void;
};

type EtfSdkFactory = (options: TinkoffInvestOptions) => EtfSdk;

const etfCommandPath = ['instrument', 'etf', 'show'] as const;
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

export function parseEtfFormat(rawOptions: CommandRawOptions): EtfFormat {
  return parseCommandOptions(rawOptions, etfFormatOptionsSchema).format;
}

export function createEtfCommand(
  createSdk: EtfSdkFactory = defaultEtfSdkFactory
) {
  return command.define({
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
