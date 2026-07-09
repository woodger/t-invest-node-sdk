/**
 * Модуль CLI-команды `instrument share list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { type InstrumentsRequest, type SharesResponse } from '../../../generated/t_tech/invest/grpc/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentsRequestFromOptions,
  instrumentStatusOptionsSchema,
  parseInstrumentStatus
} from '../../args/instruments-args';
import { formatShares, sharesFormats, type SharesFormat } from './reporter';

type SharesSdk = {
  instruments: {
    shares(request: InstrumentsRequest): Promise<SharesResponse>;
  };
  close(): void;
};

type SharesSdkFactory = (options: TinkoffInvestOptions) => SharesSdk;

const sharesCommandPath = ['instrument', 'share', 'list'] as const;
const defaultSharesSdkFactory: SharesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const sharesFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: sharesFormats,
    default: 'table'
  }
} as const;

const sharesOptionsSchema = withSdkOptions(
  instrumentStatusOptionsSchema,
  sharesFormatOptionsSchema
);

type SharesOptions = InferOptions<typeof sharesOptionsSchema>;

export const parseSharesInstrumentStatus = parseInstrumentStatus;
export const createSharesRequest = createInstrumentsRequestFromOptions;

export function parseSharesFormat(rawOptions: CommandRawOptions): SharesFormat {
  return parseCommandOptions(rawOptions, sharesFormatOptionsSchema).format;
}

export function createSharesCommand(
  createSdk: SharesSdkFactory = defaultSharesSdkFactory
) {
  return command.define({
    path: sharesCommandPath,
    options: sharesOptionsSchema,
    handle({ options }) {
      return runSharesCommand(options, createSdk);
    }
  });
}

export const sharesCommand = createSharesCommand();

async function runSharesCommand(
  options: SharesOptions,
  createSdk: SharesSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentsRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.shares(request);

    return formatShares(response.instruments, format);
  }
  finally {
    sdk.close();
  }
}

export { formatShares };
