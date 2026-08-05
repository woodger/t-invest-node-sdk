/**
 * Модуль CLI-команды `instrument future list`.
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
  FuturesResponse,
  InstrumentsRequest
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  createInstrumentsRequestFromOptions,
  instrumentStatusOptionsSchema
} from '../../args/instruments-args';
import { formatFutures, futuresFormats, type FuturesFormat } from './reporter';

type FuturesSdk = {
  instruments: {
    futures(request: InstrumentsRequest): Promise<FuturesResponse>;
  };
  close(): void;
};

type FuturesSdkFactory = (options: TInvestOptions) => FuturesSdk;

const futuresCommandPath = ['instrument', 'future', 'list'] as const;
const defaultFuturesSdkFactory: FuturesSdkFactory = (options) => new TInvestNodeSDK(options);

const futuresFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: futuresFormats,
    default: 'table'
  }
} as const;

const futuresOptionsSchema = withSdkOptions(
  instrumentStatusOptionsSchema,
  futuresFormatOptionsSchema
);

type FuturesOptions = InferOptions<typeof futuresOptionsSchema>;

export function parseFuturesFormat(rawOptions: CommandRawOptions): FuturesFormat {
  return parseCommandOptions(rawOptions, futuresFormatOptionsSchema).format;
}

export function createFuturesCommand(
  createSdk: FuturesSdkFactory = defaultFuturesSdkFactory
) {
  return command.define({
    path: futuresCommandPath,
    options: futuresOptionsSchema,
    handle({ options }) {
      return runFuturesCommand(options, createSdk);
    }
  });
}

export const futuresCommand = createFuturesCommand();

async function runFuturesCommand(
  options: FuturesOptions,
  createSdk: FuturesSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentsRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.futures(request);

    return formatFutures(response.instruments, format);
  }
  finally {
    sdk.close();
  }
}

export { formatFutures };
