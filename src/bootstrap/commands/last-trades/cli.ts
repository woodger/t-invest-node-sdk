/**
 * Модуль CLI-команды `market trades`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  GetLastTradesRequest,
  TradeSourceType,
  type GetLastTradesResponse
} from '../../../generated/marketdata';
import { CliUsageError, type InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRequestOptions } from '../../args/command-options';
import { parseDateTimeOption, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatLastTrades, lastTradesFormats } from './reporter';

type LastTradesSdk = {
  marketdata: {
    getLastTrades(request: GetLastTradesRequest): Promise<GetLastTradesResponse>;
  };
  close(): void;
};

type LastTradesSdkFactory = (options: TInvestOptions) => LastTradesSdk;

const lastTradesCommandPath = ['market', 'trades'] as const;
const defaultLastTradesSdkFactory: LastTradesSdkFactory = (options) => new TInvestNodeSDK(options);

const lastTradesRequestOptionsSchema = {
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
  }
} as const;

const lastTradesFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: lastTradesFormats,
    default: 'table'
  }
} as const;

const lastTradesOptionsSchema = withSdkOptions(
  lastTradesRequestOptionsSchema,
  lastTradesFormatOptionsSchema
);

type LastTradesOptions = InferOptions<typeof lastTradesOptionsSchema>;
type LastTradesRequestOptions = CommandRequestOptions<LastTradesOptions, 'instrument-id' | 'from' | 'to'>;

export function createLastTradesCommand(
  createSdk: LastTradesSdkFactory = defaultLastTradesSdkFactory
) {
  return command.define({
    path: lastTradesCommandPath,
    options: lastTradesOptionsSchema,
    handle({ options }) {
      return runLastTradesCommand(options, createSdk);
    }
  });
}

export const lastTradesCommand = createLastTradesCommand();

async function runLastTradesCommand(
  options: LastTradesOptions,
  createSdk: LastTradesSdkFactory
): Promise<string> {
  const request = createLastTradesRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.marketdata.getLastTrades(request);

    return formatLastTrades(response.trades, format);
  }
  finally {
    sdk.close();
  }
}

export { formatLastTrades };

export function createLastTradesRequest(
  options: LastTradesRequestOptions
): GetLastTradesRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new CliUsageError("Expected '--from' to be earlier than or equal to '--to'");
  }

  return GetLastTradesRequest.create({
    instrumentId: options['instrument-id'],
    from,
    to,
    tradeSource: TradeSourceType.TRADE_SOURCE_UNSPECIFIED
  });
}
