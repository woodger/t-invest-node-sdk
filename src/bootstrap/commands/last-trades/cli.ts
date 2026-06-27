import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetLastTradesRequest,
  GetLastTradesResponse
} from '../../../generated/marketdata';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-mechanics';
import {
  parseCommandOptions,
  parseDateTimeOption,
  withSdkOptions
} from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatLastTrades, lastTradesFormats, type LastTradesFormat } from './reporter';

type LastTradesSdk = {
  marketdata: {
    getLastTrades(request: GetLastTradesRequest): Promise<GetLastTradesResponse>;
  };
  close(): void;
};

type LastTradesSdkFactory = (options: TinkoffInvestOptions) => LastTradesSdk;

const lastTradesCommandName = 'marketdata get-last-trades';
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

function parseLastTradesOptions(rawOptions: CommandRawOptions) {
  return parseCommandOptions(rawOptions, lastTradesCommandName, lastTradesOptionsSchema);
}

export function parseLastTradesRequest(rawOptions: CommandRawOptions): GetLastTradesRequest {
  return createLastTradesRequest(parseLastTradesOptions(rawOptions));
}

export function parseLastTradesFormat(rawOptions: CommandRawOptions): LastTradesFormat {
  return parseCommandOptions(
    rawOptions,
    lastTradesCommandName,
    lastTradesFormatOptionsSchema
  ).format;
}

export function createLastTradesCommand(
  createSdk: LastTradesSdkFactory = defaultLastTradesSdkFactory
) {
  return defineCommand({
    path: lastTradesCommandPath,
    options: lastTradesOptionsSchema,
    handle({ options }) {
      return runLastTradesCommand(options, createSdk);
    }
  });
}

export const lastTradesCommand = createLastTradesCommand();

async function runLastTradesCommand(
  options: ReturnType<typeof parseLastTradesOptions>,
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

function createLastTradesRequest(
  options: ReturnType<typeof parseLastTradesOptions>
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
