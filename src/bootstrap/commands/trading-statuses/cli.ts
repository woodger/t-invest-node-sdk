/**
 * Модуль CLI-команды `market statuses`.
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
import type {
  GetTradingStatusesRequest,
  GetTradingStatusesResponse
} from '../../../generated/marketdata';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import {
  parseCommaSeparatedStringListOption,
  withSdkOptions
} from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatTradingStatuses, tradingStatusesFormats } from './reporter';

type TradingStatusesSdk = {
  marketData: {
    getTradingStatuses(
      request: GetTradingStatusesRequest
    ): Promise<GetTradingStatusesResponse>;
  };
  close(): void;
};

type TradingStatusesSdkFactory = (
  options: TInvestOptions
) => TradingStatusesSdk;

const tradingStatusesOptionsSchema = withSdkOptions({
  'instrument-id': {
    type: 'string',
    required: true
  },
  format: {
    type: 'string',
    choices: tradingStatusesFormats,
    default: 'table'
  }
});

type TradingStatusesOptions = InferOptions<typeof tradingStatusesOptionsSchema>;
type TradingStatusesRequestOptions = CommandRequestOptions<
  TradingStatusesOptions,
  'instrument-id'
>;

export function createTradingStatusesCommand(
  createSdk: TradingStatusesSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['market', 'statuses'] as const,
    options: tradingStatusesOptionsSchema,
    async handle({ options }) {
      const request = createTradingStatusesRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.marketData.getTradingStatuses(request);

        return formatTradingStatuses(response, format);
      });
    }
  });
}

export const tradingStatusesCommand = createTradingStatusesCommand();

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
