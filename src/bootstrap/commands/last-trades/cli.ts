/**
 * Модуль CLI-команды `market trades`.
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
import {
  GetLastTradesRequest,
  TradeSourceType,
  type GetLastTradesResponse
} from '../../../generated/marketdata';
import { CliUsageError, type InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { parseDateTimeOption, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatLastTrades, lastTradesFormats } from './reporter';

type LastTradesSdk = {
  marketData: {
    getLastTrades(
      request: GetLastTradesRequest
    ): Promise<GetLastTradesResponse>;
  };
  close(): void;
};

type LastTradesSdkFactory = (options: TInvestOptions) => LastTradesSdk;

type LastTradesOptions = InferOptions<typeof lastTradesOptionsSchema>;
type LastTradesRequestOptions = CommandRequestOptions<
  LastTradesOptions,
  'instrument-id' | 'from' | 'to'
>;

const lastTradesOptionsSchema = withSdkOptions({
  'instrument-id': {
    type: 'string',
    required: true
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
    choices: lastTradesFormats,
    default: 'table'
  }
});

export function createLastTradesCommand(
  createSdk: LastTradesSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['market', 'trades'] as const,
    options: lastTradesOptionsSchema,
    async handle({ options }) {
      const request = createLastTradesRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.marketData.getLastTrades(request);

        return formatLastTrades(response.trades, format);
      });
    }
  });
}

export const lastTradesCommand = createLastTradesCommand();

export function createLastTradesRequest(
  options: LastTradesRequestOptions
): GetLastTradesRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new CliUsageError(
      "Expected '--from' to be earlier than or equal to '--to'"
    );
  }

  return GetLastTradesRequest.create({
    instrumentId: options['instrument-id'],
    from,
    to,
    tradeSource: TradeSourceType.TRADE_SOURCE_UNSPECIFIED
  });
}
