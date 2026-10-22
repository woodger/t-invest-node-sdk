/**
 * Модуль CLI-команды `instrument schedules`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { TradingSchedulesRequest, TradingSchedulesResponse } from '../../../generated/instruments';
import { CliUsageError, type InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { parseDateTimeOption, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatTradingSchedules, tradingSchedulesFormats } from './reporter';

type TradingSchedulesSdk = {
  instruments: {
    tradingSchedules(
      request: TradingSchedulesRequest
    ): Promise<TradingSchedulesResponse>;
  };
  close(): void;
};

type TradingSchedulesSdkFactory = (
  options: TInvestOptions
) => TradingSchedulesSdk;

type TradingSchedulesOptions = InferOptions<
  typeof tradingSchedulesOptionsSchema
>;
type TradingSchedulesRequestOptions = CommandRequestOptions<
  TradingSchedulesOptions,
  'from' | 'to' | 'exchange'
>;

const tradingSchedulesOptionsSchema = withSdkOptions({
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
  },
  format: {
    type: 'string',
    choices: tradingSchedulesFormats,
    default: 'table'
  }
});

export function createTradingSchedulesCommand(
  createSdk: TradingSchedulesSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'schedules'] as const,
    options: tradingSchedulesOptionsSchema,
    async handle({ options }) {
      const request = createTradingSchedulesRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.tradingSchedules(request);

        return formatTradingSchedules(response.exchanges, format);
      });
    }
  });
}

export const tradingSchedulesCommand = createTradingSchedulesCommand();

export function createTradingSchedulesRequest(
  options: TradingSchedulesRequestOptions
): TradingSchedulesRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new CliUsageError(
      "Expected '--from' to be earlier than or equal to '--to'"
    );
  }

  return {
    exchange: options.exchange ?? '',
    from,
    to
  };
}
