/**
 * Модуль CLI-команды `marketdata get-last-trades`.
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
  GetLastTradesRequest,
  GetLastTradesResponse
} from '../../../generated/marketdata';
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
import { formatLastTrades, lastTradesFormats, type LastTradesFormat } from './reporter';

type LastTradesSdk = {
  marketdata: {
    getLastTrades(request: GetLastTradesRequest): Promise<GetLastTradesResponse>;
  };
  close(): void;
};

type LastTradesSdkFactory = (options: TinkoffInvestOptions) => LastTradesSdk;

const lastTradesCommandPath = ['marketdata', 'get-last-trades'] as const;
const defaultLastTradesSdkFactory: LastTradesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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



export function parseLastTradesFormat(rawOptions: CommandRawOptions): LastTradesFormat {
  return parseCommandOptions(rawOptions, lastTradesFormatOptionsSchema).format;
}

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
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    figi: '',
    instrumentId: options['instrument-id'],
    from,
    to
  };
}
