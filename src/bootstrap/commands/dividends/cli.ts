/**
 * Модуль CLI-команды `instrument dividends`.
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
  GetDividendsRequest,
  GetDividendsResponse
} from '../../../generated/instruments';
import { CliUsageError, type InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import {
  parseCommandOptions,
  parseDateTimeOption,
  withSdkOptions
} from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  instrumentIdWithDeprecatedFigiOptionsSchema,
  resolveInstrumentIdOption
} from '../../args/instrument-id-options';
import { dividendsFormats, formatDividends, type DividendsFormat } from './reporter';

type DividendsSdk = {
  instruments: {
    getDividends(request: GetDividendsRequest): Promise<GetDividendsResponse>;
  };
  close(): void;
};

type DividendsSdkFactory = (options: TInvestOptions) => DividendsSdk;

const dividendsCommandPath = ['instrument', 'dividends'] as const;
const defaultDividendsSdkFactory: DividendsSdkFactory = (options) => new TInvestNodeSDK(options);

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
  return command.define({
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
    throw new CliUsageError("Expected '--from' to be earlier than or equal to '--to'");
  }

  const instrumentId = resolveInstrumentIdOption(options);

  return {
    figi: instrumentId,
    instrumentId,
    from,
    to
  };
}
