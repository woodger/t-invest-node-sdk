import type { Quotation } from '../../../generated/common';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  CandleInterval,
  type GetCandlesRequest,
  type GetCandlesResponse,
  type HistoricCandle
} from '../../../generated/marketdata';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';

type CandlesFormat = 'json' | 'csv';

type CandleOutput = {
  time: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: number;
  isComplete: boolean;
};

type CandlesSdk = {
  marketdata: {
    getCandles(request: GetCandlesRequest): Promise<GetCandlesResponse>;
  };
  close(): void;
};

type CandlesSdkFactory = (options: TinkoffInvestOptions) => CandlesSdk;

const candlesFormatValues = ['json', 'csv'] as const;
const candlesArgNames = new Set([
  ...sdkOptionArgNames,
  'instrument-id',
  'from',
  'to',
  'interval',
  'format'
]);

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

type CandleIntervalName = keyof typeof candleIntervals;

function csvValue(value: string | number | boolean): string {
  const text = String(value);

  if (!/[",\n]/.test(text)) {
    return text;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

function formatQuotation(value: Quotation | undefined): string {
  if (value === undefined) {
    return '';
  }

  return String(value.units + value.nano / 1e9);
}

function toCandleOutput(candle: HistoricCandle): CandleOutput {
  return {
    time: formatDate(candle.time),
    open: formatQuotation(candle.open),
    high: formatQuotation(candle.high),
    low: formatQuotation(candle.low),
    close: formatQuotation(candle.close),
    volume: candle.volume,
    isComplete: candle.isComplete
  };
}

export function parseCandleInterval(argv: CliArgs): CandleInterval {
  const interval = ArgGuards.requireStringArg(argv, 'interval');

  if (!(interval in candleIntervals)) {
    throw new Error(`Expected '--interval' as one of: ${Object.keys(candleIntervals).join(', ')}`);
  }

  return candleIntervals[interval as CandleIntervalName];
}

export function parseCandlesRequest(argv: CliArgs): GetCandlesRequest {
  const from = ArgGuards.parseDateArg(argv, 'from');
  const to = ArgGuards.parseDateArg(argv, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    figi: '',
    instrumentId: ArgGuards.requireStringArg(argv, 'instrument-id'),
    from,
    to,
    interval: parseCandleInterval(argv)
  };
}

export function parseCandlesFormat(argv: CliArgs): CandlesFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', candlesFormatValues) ?? 'json';
}

export function formatCandles(candles: HistoricCandle[], format: CandlesFormat): string {
  const output = candles.map(toCandleOutput);

  if (format === 'json') {
    return `${JSON.stringify(output, null, 2)}\n`;
  }

  return [
    'time,open,high,low,close,volume,isComplete',
    ...output.map((candle) => [
      candle.time,
      candle.open,
      candle.high,
      candle.low,
      candle.close,
      candle.volume,
      candle.isComplete
    ].map(csvValue).join(',')),
    ''
  ].join('\n');
}

export function createCandlesCommand(
  createSdk: CandlesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function candles(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, candlesArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'candles');

    const request = parseCandlesRequest(argv);
    const format = parseCandlesFormat(argv);
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
