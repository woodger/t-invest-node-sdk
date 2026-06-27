import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  CandleInterval,
  type GetCandlesRequest,
  type GetCandlesResponse
} from '../../../generated/marketdata';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import {
  parseCommandOptions,
  parseDateTimeOption,
  withSdkOptions
} from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { candlesFormats, formatCandles, type CandlesFormat } from './reporter';

type CandlesSdk = {
  marketdata: {
    getCandles(request: GetCandlesRequest): Promise<GetCandlesResponse>;
  };
  close(): void;
};

type CandlesSdkFactory = (options: TinkoffInvestOptions) => CandlesSdk;

const candlesCommandName = 'marketdata get-candles';
const candlesCommandPath = ['marketdata', 'get-candles'] as const;
const defaultCandlesSdkFactory: CandlesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const candleIntervals = {
  '1min': CandleInterval.CANDLE_INTERVAL_1_MIN,
  '2min': CandleInterval.CANDLE_INTERVAL_2_MIN,
  '3min': CandleInterval.CANDLE_INTERVAL_3_MIN,
  '5min': CandleInterval.CANDLE_INTERVAL_5_MIN,
  '10min': CandleInterval.CANDLE_INTERVAL_10_MIN,
  '15min': CandleInterval.CANDLE_INTERVAL_15_MIN,
  '30min': CandleInterval.CANDLE_INTERVAL_30_MIN,
  hour: CandleInterval.CANDLE_INTERVAL_HOUR,
  '1hour': CandleInterval.CANDLE_INTERVAL_HOUR,
  '2hour': CandleInterval.CANDLE_INTERVAL_2_HOUR,
  '4hour': CandleInterval.CANDLE_INTERVAL_4_HOUR,
  day: CandleInterval.CANDLE_INTERVAL_DAY,
  week: CandleInterval.CANDLE_INTERVAL_WEEK,
  month: CandleInterval.CANDLE_INTERVAL_MONTH
} as const;

const candleIntervalNames = Object.keys(candleIntervals) as Array<keyof typeof candleIntervals>;

type CandleIntervalName = keyof typeof candleIntervals;

const candlesRequestOptionsSchema = {
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
  interval: {
    type: 'string',
    choices: candleIntervalNames,
    required: true
  }
} as const;

const candlesFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: candlesFormats,
    default: 'json'
  }
} as const;

const candlesOptionsSchema = withSdkOptions(
  candlesRequestOptionsSchema,
  candlesFormatOptionsSchema
);

function parseCandlesOptions(argv: CliArgs) {
  return parseCommandOptions(argv, candlesCommandName, candlesOptionsSchema);
}

export function parseCandleInterval(argv: CliArgs): CandleInterval {
  const { interval } = parseCommandOptions(
    argv,
    candlesCommandName,
    { interval: candlesRequestOptionsSchema.interval } as const
  );

  return candleIntervals[interval as CandleIntervalName];
}

export function parseCandlesRequest(argv: CliArgs): GetCandlesRequest {
  return createCandlesRequest(parseCandlesOptions(argv));
}

export function parseCandlesFormat(argv: CliArgs): CandlesFormat {
  return parseCommandOptions(
    argv,
    candlesCommandName,
    candlesFormatOptionsSchema
  ).format;
}

export function createCandlesCommand(
  createSdk: CandlesSdkFactory = defaultCandlesSdkFactory
) {
  return defineCommand({
    path: candlesCommandPath,
    options: candlesOptionsSchema,
    handle({ options }) {
      return runCandlesCommand(options, createSdk);
    }
  });
}

export const candlesCommand = createCandlesCommand();

async function runCandlesCommand(
  options: ReturnType<typeof parseCandlesOptions>,
  createSdk: CandlesSdkFactory
): Promise<string> {
  const request = createCandlesRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.marketdata.getCandles(request);

    return formatCandles(response.candles, format);
  }
  finally {
    sdk.close();
  }
}

export { formatCandles };

function createCandlesRequest(
  options: ReturnType<typeof parseCandlesOptions>
): GetCandlesRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    figi: '',
    instrumentId: options['instrument-id'],
    from,
    to,
    interval: candleIntervals[options.interval as CandleIntervalName]
  };
}
