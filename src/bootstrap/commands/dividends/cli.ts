/**
 * Модуль CLI-команды `instruments get-dividends`.
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
  GetDividendsRequest,
  GetDividendsResponse
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
import { dividendsFormats, formatDividends, type DividendsFormat } from './reporter';

type DividendsSdk = {
  instruments: {
    getDividends(request: GetDividendsRequest): Promise<GetDividendsResponse>;
  };
  close(): void;
};

type DividendsSdkFactory = (options: TinkoffInvestOptions) => DividendsSdk;

const dividendsCommandPath = ['instruments', 'get-dividends'] as const;
const defaultDividendsSdkFactory: DividendsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const dividendsRequestOptionsSchema = {
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

const dividendsFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: dividendsFormats,
    default: 'table'
  }
} as const;

const dividendsOptionsSchema = withSdkOptions(
  dividendsRequestOptionsSchema,
  dividendsFormatOptionsSchema
);

type DividendsOptions = InferOptions<typeof dividendsOptionsSchema>;
type DividendsRequestOptions = CommandRequestOptions<
  DividendsOptions,
  'from' | 'to' | 'instrument-id' | 'figi'
>;



export function parseDividendsFormat(rawOptions: CommandRawOptions): DividendsFormat {
  return parseCommandOptions(rawOptions, dividendsFormatOptionsSchema).format;
}

export function createDividendsCommand(
  createSdk: DividendsSdkFactory = defaultDividendsSdkFactory
) {
  return defineCommand({
    path: dividendsCommandPath,
    options: dividendsOptionsSchema,
    handle({ options }) {
      return runDividendsCommand(options, createSdk);
    }
  });
}

export const dividendsCommand = createDividendsCommand();

async function runDividendsCommand(
  options: DividendsOptions,
  createSdk: DividendsSdkFactory
): Promise<string> {
  const request = createDividendsRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.getDividends(request);

    return formatDividends(response.dividends, format);
  }
  finally {
    sdk.close();
  }
}

export { formatDividends };

export function createDividendsRequest(
  options: DividendsRequestOptions
): GetDividendsRequest {
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
