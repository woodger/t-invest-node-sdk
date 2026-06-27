import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetLastTradesRequest,
  GetLastTradesResponse
} from '../../../generated/marketdata';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
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

function parseLastTradesOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'marketdata get-last-trades', lastTradesOptionsSchema);
}

export function parseLastTradesRequest(argv: CliArgs): GetLastTradesRequest {
  return createLastTradesRequest(parseLastTradesOptions(argv));
}

export function parseLastTradesFormat(argv: CliArgs): LastTradesFormat {
  return parseCommandOptions(
    argv,
    'marketdata get-last-trades',
    lastTradesFormatOptionsSchema
  ).format;
}

export function createLastTradesCommand(
  createSdk: LastTradesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function lastTrades(argv: CliArgs): Promise<string> {
    const options = parseLastTradesOptions(argv);
    const request = createLastTradesRequest(options);
    const { format } = options;
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.marketdata.getLastTrades(request);

      return formatLastTrades(response.trades, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const lastTrades = createLastTradesCommand();

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
