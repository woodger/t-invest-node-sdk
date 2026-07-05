/**
 * Модуль CLI-команды `marketdata get-trading-status`.
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
  GetTradingStatusRequest,
  GetTradingStatusResponse
} from '../../../generated/marketdata';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  formatTradingStatus,
  tradingStatusFormats,
  type TradingStatusFormat
} from './reporter';

type TradingStatusSdk = {
  marketdata: {
    getTradingStatus(request: GetTradingStatusRequest): Promise<GetTradingStatusResponse>;
  };
  close(): void;
};

type TradingStatusSdkFactory = (options: TinkoffInvestOptions) => TradingStatusSdk;

const tradingStatusCommandPath = ['marketdata', 'get-trading-status'] as const;
const defaultTradingStatusSdkFactory: TradingStatusSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const tradingStatusRequestOptionsSchema = {
  'instrument-id': {
    type: 'string',
    required: true
  }
} as const;

const tradingStatusFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: tradingStatusFormats,
    default: 'table'
  }
} as const;

const tradingStatusOptionsSchema = withSdkOptions(
  tradingStatusRequestOptionsSchema,
  tradingStatusFormatOptionsSchema
);

type TradingStatusOptions = InferOptions<typeof tradingStatusOptionsSchema>;
type TradingStatusRequestOptions = CommandRequestOptions<TradingStatusOptions, 'instrument-id'>;



export function parseTradingStatusFormat(rawOptions: CommandRawOptions): TradingStatusFormat {
  return parseCommandOptions(rawOptions, tradingStatusFormatOptionsSchema).format;
}

export function createTradingStatusCommand(
  createSdk: TradingStatusSdkFactory = defaultTradingStatusSdkFactory
) {
  return command.define({
    path: tradingStatusCommandPath,
    options: tradingStatusOptionsSchema,
    handle({ options }) {
      return runTradingStatusCommand(options, createSdk);
    }
  });
}

export const tradingStatusCommand = createTradingStatusCommand();

async function runTradingStatusCommand(
  options: TradingStatusOptions,
  createSdk: TradingStatusSdkFactory
): Promise<string> {
  const request = createTradingStatusRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.marketdata.getTradingStatus(request);

    return formatTradingStatus(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatTradingStatus };

export function createTradingStatusRequest(
  options: TradingStatusRequestOptions
): GetTradingStatusRequest {
  return {
    figi: '',
    instrumentId: options['instrument-id']
  };
}
