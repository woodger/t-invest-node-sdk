/**
 * Модуль CLI-команды `market status`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  GetTradingStatusRequest,
  type GetTradingStatusResponse
} from '../../../generated/marketdata';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatTradingStatus, tradingStatusFormats } from './reporter';

type TradingStatusSdk = {
  marketData: {
    getTradingStatus(request: GetTradingStatusRequest): Promise<GetTradingStatusResponse>;
  };
  close(): void;
};

type TradingStatusSdkFactory = (options: TInvestOptions) => TradingStatusSdk;

const tradingStatusCommandPath = ['market', 'status'] as const;
const defaultTradingStatusSdkFactory: TradingStatusSdkFactory = (options) => new TInvestNodeSDK(options);

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
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.marketData.getTradingStatus(request);

    return formatTradingStatus(response, format);
  });
}

export function createTradingStatusRequest(
  options: TradingStatusRequestOptions
): GetTradingStatusRequest {
  return GetTradingStatusRequest.create({
    instrumentId: options['instrument-id']
  });
}
