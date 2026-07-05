/**
 * Модуль CLI-команды `instruments trading-schedules`.
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
  TradingSchedulesRequest,
  TradingSchedulesResponse
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import {
  parseCommandOptions,
  parseDateTimeOption,
  withSdkOptions
} from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  formatTradingSchedules,
  tradingSchedulesFormats,
  type TradingSchedulesFormat
} from './reporter';

type TradingSchedulesSdk = {
  instruments: {
    tradingSchedules(request: TradingSchedulesRequest): Promise<TradingSchedulesResponse>;
  };
  close(): void;
};

type TradingSchedulesSdkFactory = (options: TinkoffInvestOptions) => TradingSchedulesSdk;

const tradingSchedulesCommandPath = ['instruments', 'trading-schedules'] as const;
const defaultTradingSchedulesSdkFactory: TradingSchedulesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const tradingSchedulesRequestOptionsSchema = {
  exchange: {
    type: 'string'
  },
  from: {
    type: 'string',
    required: true
  },
  to: {
    type: 'string',
    required: true
  }
} as const;

const tradingSchedulesFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: tradingSchedulesFormats,
    default: 'table'
  }
} as const;

const tradingSchedulesOptionsSchema = withSdkOptions(
  tradingSchedulesRequestOptionsSchema,
  tradingSchedulesFormatOptionsSchema
);

type TradingSchedulesOptions = InferOptions<typeof tradingSchedulesOptionsSchema>;
type TradingSchedulesRequestOptions = CommandRequestOptions<TradingSchedulesOptions, 'from' | 'to' | 'exchange'>;



export function parseTradingSchedulesFormat(rawOptions: CommandRawOptions): TradingSchedulesFormat {
  return parseCommandOptions(rawOptions, tradingSchedulesFormatOptionsSchema).format;
}

export function createTradingSchedulesCommand(
  createSdk: TradingSchedulesSdkFactory = defaultTradingSchedulesSdkFactory
) {
  return command.define({
    path: tradingSchedulesCommandPath,
    options: tradingSchedulesOptionsSchema,
    handle({ options }) {
      return runTradingSchedulesCommand(options, createSdk);
    }
  });
}

export const tradingSchedulesCommand = createTradingSchedulesCommand();

async function runTradingSchedulesCommand(
  options: TradingSchedulesOptions,
  createSdk: TradingSchedulesSdkFactory
): Promise<string> {
  const request = createTradingSchedulesRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.tradingSchedules(request);

    return formatTradingSchedules(response.exchanges, format);
  }
  finally {
    sdk.close();
  }
}

export { formatTradingSchedules };

export function createTradingSchedulesRequest(
  options: TradingSchedulesRequestOptions
): TradingSchedulesRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    exchange: options.exchange ?? '',
    from,
    to
  };
}
