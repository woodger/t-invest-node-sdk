/**
 * Модуль CLI-команды `instruments future-by`.
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
  FutureResponse,
  InstrumentRequest
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../command-options';
import { parseCommandOptions, withSdkOptions } from '../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
  instrumentLookupOptionsSchema,
  parseInstrumentLookupIdType,
} from '../instruments-args';
import { formatFuture, futureFormats, type FutureFormat } from './reporter';

type FutureSdk = {
  instruments: {
    futureBy(request: InstrumentRequest): Promise<FutureResponse>;
  };
  close(): void;
};

type FutureSdkFactory = (options: TinkoffInvestOptions) => FutureSdk;

const futureCommandPath = ['instruments', 'future-by'] as const;
const defaultFutureSdkFactory: FutureSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

export const parseFutureIdType = parseInstrumentLookupIdType;
export const createFutureRequest = createInstrumentLookupRequestFromOptions;

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
