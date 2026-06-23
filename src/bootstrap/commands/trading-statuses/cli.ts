import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetTradingStatusesRequest,
  GetTradingStatusesResponse
} from '../../../generated/marketdata';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
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

const tradingStatusesArgNames = new Set([
  ...sdkOptionArgNames,
  'instrument-id',
  'format'
]);

export function parseTradingStatusesInstrumentIds(argv: CliArgs): string[] {
  const rawValue = ArgGuards.requireStringArg(argv, 'instrument-id');
  const instrumentIds = rawValue.split(',').map((value) => value.trim());

  if (instrumentIds.some((value) => value === '')) {
    throw new Error("Expected '--instrument-id' as comma-separated list");
  }

  return instrumentIds;
}

export function parseTradingStatusesRequest(argv: CliArgs): GetTradingStatusesRequest {
  return {
    instrumentId: parseTradingStatusesInstrumentIds(argv)
  };
}

export function parseTradingStatusesFormat(argv: CliArgs): TradingStatusesFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', tradingStatusesFormats) ?? 'table';
}

export function createTradingStatusesCommand(
  createSdk: TradingStatusesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function tradingStatuses(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, tradingStatusesArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'marketdata get-trading-statuses');

    const request = parseTradingStatusesRequest(argv);
    const format = parseTradingStatusesFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.marketdata.getTradingStatuses(request);

      return formatTradingStatuses(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const tradingStatuses = createTradingStatusesCommand();

export { formatTradingStatuses };
