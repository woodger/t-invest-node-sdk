import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetTradingStatusRequest,
  GetTradingStatusResponse
} from '../../../generated/marketdata';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
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

const tradingStatusArgNames = new Set([
  ...sdkOptionArgNames,
  'instrument-id',
  'format'
]);

export function parseTradingStatusRequest(argv: CliArgs): GetTradingStatusRequest {
  return {
    figi: '',
    instrumentId: ArgGuards.requireStringArg(argv, 'instrument-id')
  };
}

export function parseTradingStatusFormat(argv: CliArgs): TradingStatusFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', tradingStatusFormats) ?? 'table';
}

export function createTradingStatusCommand(
  createSdk: TradingStatusSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function tradingStatus(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, tradingStatusArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'marketdata get-trading-status');

    const request = parseTradingStatusRequest(argv);
    const format = parseTradingStatusFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.marketdata.getTradingStatus(request);

      return formatTradingStatus(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const tradingStatus = createTradingStatusCommand();

export { formatTradingStatus };
