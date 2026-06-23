import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  TradingSchedulesRequest,
  TradingSchedulesResponse
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
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

const tradingSchedulesArgNames = new Set([
  ...sdkOptionArgNames,
  'exchange',
  'from',
  'to',
  'format'
]);

export function parseTradingSchedulesRequest(argv: CliArgs): TradingSchedulesRequest {
  const from = ArgGuards.parseDateArg(argv, 'from');
  const to = ArgGuards.parseDateArg(argv, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    exchange: ArgGuards.optionalStringArgValue(argv, 'exchange') ?? '',
    from,
    to
  };
}

export function parseTradingSchedulesFormat(argv: CliArgs): TradingSchedulesFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', tradingSchedulesFormats) ?? 'table';
}

export function createTradingSchedulesCommand(
  createSdk: TradingSchedulesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function tradingSchedules(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, tradingSchedulesArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments trading-schedules');

    const request = parseTradingSchedulesRequest(argv);
    const format = parseTradingSchedulesFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.tradingSchedules(request);

      return formatTradingSchedules(response.exchanges, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const tradingSchedules = createTradingSchedulesCommand();

export { formatTradingSchedules };
