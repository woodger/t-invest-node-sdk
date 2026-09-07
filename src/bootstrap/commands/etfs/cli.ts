/**
 * Модуль CLI-команды `instrument etf list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  EtfsResponse,
  InstrumentsRequest
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  createInstrumentsRequestFromOptions,
  instrumentStatusOptionsSchema
} from '../../args/instruments-args';
import { etfsFormats, formatEtfs } from './reporter';

type EtfsSdk = {
  instruments: {
    etfs(request: InstrumentsRequest): Promise<EtfsResponse>;
  };
  close(): void;
};

type EtfsSdkFactory = (options: TInvestOptions) => EtfsSdk;

const etfsCommandPath = ['instrument', 'etf', 'list'] as const;
const defaultEtfsSdkFactory: EtfsSdkFactory = (options) => new TInvestNodeSDK(options);

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
