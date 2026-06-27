import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  CandleInterval,
  type GetCandlesRequest,
  type GetCandlesResponse
} from '../../../generated/marketdata';
import { resolveSdkOptions } from '../../args';
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
  return parseCommandOptions(argv, 'marketdata get-candles', candlesOptionsSchema);
}

export function parseCandleInterval(argv: CliArgs): CandleInterval {
  const { interval } = parseCommandOptions(
    argv,
    'marketdata get-candles',
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
    'marketdata get-candles',
    candlesFormatOptionsSchema
  ).format;
}

export function createCandlesCommand(
  createSdk: CandlesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function candles(argv: CliArgs): Promise<string> {
    const options = parseCandlesOptions(argv);
    const request = createCandlesRequest(options);
    const { format } = options;
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.marketdata.getCandles(request);

      return formatCandles(response.candles, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const candles = createCandlesCommand();

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
