/**
 * Модуль CLI-команды `instrument future show`.
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
  FutureResponse,
  InstrumentRequest
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
  instrumentLookupOptionsSchema
} from '../../args/instruments-args';
import { formatFuture, futureFormats, type FutureFormat } from './reporter';

type FutureSdk = {
  instruments: {
    futureBy(request: InstrumentRequest): Promise<FutureResponse>;
  };
  close(): void;
};

type FutureSdkFactory = (options: TInvestOptions) => FutureSdk;

const futureCommandPath = ['instrument', 'future', 'show'] as const;
const defaultFutureSdkFactory: FutureSdkFactory = (options) => new TInvestNodeSDK(options);

const futureFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: futureFormats,
    default: 'table'
  }
} as const;

const futureOptionsSchema = withSdkOptions(
  instrumentLookupOptionsSchema,
  futureFormatOptionsSchema
);

type FutureOptions = InferOptions<typeof futureOptionsSchema>;

export function parseFutureFormat(rawOptions: CommandRawOptions): FutureFormat {
  return parseCommandOptions(rawOptions, futureFormatOptionsSchema).format;
}

export function createFutureCommand(
  createSdk: FutureSdkFactory = defaultFutureSdkFactory
) {
  return command.define({
    path: futureCommandPath,
    options: futureOptionsSchema,
    handle({ options }) {
      return runFutureCommand(options, createSdk);
    }
  });
}

export const futureCommand = createFutureCommand();

async function runFutureCommand(
  options: FutureOptions,
  createSdk: FutureSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentLookupRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.futureBy(request);

    return formatFuture(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatFuture };
