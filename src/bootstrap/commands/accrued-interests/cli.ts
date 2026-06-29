/**
 * Модуль CLI-команды `instruments get-accrued-interests`.
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
  GetAccruedInterestsRequest,
  GetAccruedInterestsResponse
} from '../../../generated/instruments';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../command-options';
import {
  parseCommandOptions,
  parseDateTimeOption,
  withSdkOptions
} from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentIdWithDeprecatedFigiOptionsSchema,
  resolveInstrumentIdOption
} from '../instrument-id-options';
import {
  accruedInterestsFormats,
  formatAccruedInterests,
  type AccruedInterestsFormat
} from './reporter';

type AccruedInterestsSdk = {
  instruments: {
    getAccruedInterests(request: GetAccruedInterestsRequest): Promise<GetAccruedInterestsResponse>;
  };
  close(): void;
};

type AccruedInterestsSdkFactory = (options: TinkoffInvestOptions) => AccruedInterestsSdk;

const accruedInterestsCommandPath = ['instruments', 'get-accrued-interests'] as const;
const defaultAccruedInterestsSdkFactory: AccruedInterestsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const accruedInterestsRequestOptionsSchema = {
  ...instrumentIdWithDeprecatedFigiOptionsSchema,
  from: {
    type: 'string',
    required: true
  },
  to: {
    type: 'string',
    required: true
  }
} as const;

const accruedInterestsFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: accruedInterestsFormats,
    default: 'table'
  }
} as const;

const accruedInterestsOptionsSchema = withSdkOptions(
  accruedInterestsRequestOptionsSchema,
  accruedInterestsFormatOptionsSchema
);

type AccruedInterestsOptions = InferOptions<typeof accruedInterestsOptionsSchema>;
type AccruedInterestsRequestOptions = CommandRequestOptions<
  AccruedInterestsOptions,
  'from' | 'to' | 'instrument-id' | 'figi'
>;



export function parseAccruedInterestsFormat(rawOptions: CommandRawOptions): AccruedInterestsFormat {
  return parseCommandOptions(rawOptions, accruedInterestsFormatOptionsSchema).format;
}

export function createAccruedInterestsCommand(
  createSdk: AccruedInterestsSdkFactory = defaultAccruedInterestsSdkFactory
) {
  return defineCommand({
    path: accruedInterestsCommandPath,
    options: accruedInterestsOptionsSchema,
    handle({ options }) {
      return runAccruedInterestsCommand(options, createSdk);
    }
  });
}

export const accruedInterestsCommand = createAccruedInterestsCommand();

async function runAccruedInterestsCommand(
  options: AccruedInterestsOptions,
  createSdk: AccruedInterestsSdkFactory
): Promise<string> {
  const request = createAccruedInterestsRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.getAccruedInterests(request);

    return formatAccruedInterests(response.accruedInterests, format);
  }
  finally {
    sdk.close();
  }
}

export { formatAccruedInterests };

export function createAccruedInterestsRequest(
  options: AccruedInterestsRequestOptions
): GetAccruedInterestsRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    figi: resolveInstrumentIdOption(options),
    from,
    to
  };
}
