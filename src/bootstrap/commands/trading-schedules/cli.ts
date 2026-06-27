import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  TradingSchedulesRequest,
  TradingSchedulesResponse
} from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import {
  parseCommandOptions,
  parseDateTimeOption,
  withSdkOptions
} from '../../command-mechanics';
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

const tradingSchedulesRequestOptionsSchema = {
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
  }
} as const;

const tradingSchedulesFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: tradingSchedulesFormats,
    default: 'table'
  }
} as const;

const tradingSchedulesOptionsSchema = withSdkOptions({
  ...tradingSchedulesRequestOptionsSchema,
  ...tradingSchedulesFormatOptionsSchema
} as const);

function parseTradingSchedulesOptions(argv: CliArgs) {
  return parseCommandOptions(
    argv,
    'instruments trading-schedules',
    tradingSchedulesOptionsSchema
  );
}

export function parseTradingSchedulesRequest(argv: CliArgs): TradingSchedulesRequest {
  return createTradingSchedulesRequest(parseTradingSchedulesOptions(argv));
}

export function parseTradingSchedulesFormat(argv: CliArgs): TradingSchedulesFormat {
  return parseCommandOptions(
    argv,
    'instruments trading-schedules',
    tradingSchedulesFormatOptionsSchema
  ).format;
}

export function createTradingSchedulesCommand(
  createSdk: TradingSchedulesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function tradingSchedules(argv: CliArgs): Promise<string> {
    const options = parseTradingSchedulesOptions(argv);
    const request = createTradingSchedulesRequest(options);
    const { format } = options;
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

function createTradingSchedulesRequest(
  options: ReturnType<typeof parseTradingSchedulesOptions>
): TradingSchedulesRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    exchange: options.exchange ?? '',
    from,
    to
  };
}
