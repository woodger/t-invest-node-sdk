/**
 * Модуль CLI-команды `marketdata get-trading-statuses`.
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
  GetTradingStatusesRequest,
  GetTradingStatusesResponse
} from '../../../generated/marketdata';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../command-options';
import {
  parseCommaSeparatedStringListOption,
  parseCommandOptions,
  withSdkOptions
} from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  formatTradingStatuses,
  tradingStatusesFormats,
  type TradingStatusesFormat
} from './reporter';

type TradingStatusesSdk = {
  marketdata: {
    getTradingStatuses(request: GetTradingStatusesRequest): Promise<GetTradingStatusesResponse>;
  };
  close(): void;
};

type TradingStatusesSdkFactory = (options: TinkoffInvestOptions) => TradingStatusesSdk;

const tradingStatusesCommandPath = ['marketdata', 'get-trading-statuses'] as const;
const defaultTradingStatusesSdkFactory: TradingStatusesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const tradingStatusesInstrumentIdsOptionsSchema = {
  'instrument-id': {
    type: 'string',
    required: true
  }
} as const;

const tradingStatusesFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: tradingStatusesFormats,
    default: 'table'
  }
} as const;

const tradingStatusesOptionsSchema = withSdkOptions(
  tradingStatusesInstrumentIdsOptionsSchema,
  tradingStatusesFormatOptionsSchema
);

type TradingStatusesOptions = InferOptions<typeof tradingStatusesOptionsSchema>;
type TradingStatusesRequestOptions = CommandRequestOptions<TradingStatusesOptions, 'instrument-id'>;


export function parseTradingStatusesInstrumentIds(rawOptions: CommandRawOptions): string[] {
  const options = parseCommandOptions(rawOptions, tradingStatusesInstrumentIdsOptionsSchema);

  return parseCommaSeparatedStringListOption(options['instrument-id'], 'instrument-id');
}


export function parseTradingStatusesFormat(rawOptions: CommandRawOptions): TradingStatusesFormat {
  return parseCommandOptions(rawOptions, tradingStatusesFormatOptionsSchema).format;
}

export function createTradingStatusesCommand(
  createSdk: TradingStatusesSdkFactory = defaultTradingStatusesSdkFactory
) {
  return command.define({
    path: tradingStatusesCommandPath,
    options: tradingStatusesOptionsSchema,
    handle({ options }) {
      return runTradingStatusesCommand(options, createSdk);
    }
  });
}

export const tradingStatusesCommand = createTradingStatusesCommand();

async function runTradingStatusesCommand(
  options: TradingStatusesOptions,
  createSdk: TradingStatusesSdkFactory
): Promise<string> {
  const request = createTradingStatusesRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.marketdata.getTradingStatuses(request);

    return formatTradingStatuses(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatTradingStatuses };

export function createTradingStatusesRequest(
  options: TradingStatusesRequestOptions
): GetTradingStatusesRequest {
  return {
    instrumentId: parseCommaSeparatedStringListOption(
      options['instrument-id'],
      'instrument-id'
    )
  };
}
