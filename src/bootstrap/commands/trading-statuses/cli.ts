import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetTradingStatusesRequest,
  GetTradingStatusesResponse
} from '../../../generated/marketdata';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import {
  parseCommaSeparatedStringListOption,
  parseCommandOptions,
  withSdkOptions
} from '../../command-mechanics';
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

const tradingStatusesInstrumentIdsOptionsSchema = {
  'instrument-id': {
    type: 'string',
    required: true
  }
} as const;

const tradingStatusesFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: tradingStatusesFormats,
    default: 'table'
  }
} as const;

const tradingStatusesOptionsSchema = withSdkOptions({
  ...tradingStatusesInstrumentIdsOptionsSchema,
  ...tradingStatusesFormatOptionsSchema
} as const);

function parseTradingStatusesOptions(argv: CliArgs) {
  return parseCommandOptions(
    argv,
    'marketdata get-trading-statuses',
    tradingStatusesOptionsSchema
  );
}

export function parseTradingStatusesInstrumentIds(argv: CliArgs): string[] {
  const options = parseCommandOptions(
    argv,
    'marketdata get-trading-statuses',
    tradingStatusesInstrumentIdsOptionsSchema
  );

  return parseCommaSeparatedStringListOption(options['instrument-id'], 'instrument-id');
}

export function parseTradingStatusesRequest(argv: CliArgs): GetTradingStatusesRequest {
  return createTradingStatusesRequest(parseTradingStatusesOptions(argv));
}

export function parseTradingStatusesFormat(argv: CliArgs): TradingStatusesFormat {
  return parseCommandOptions(
    argv,
    'marketdata get-trading-statuses',
    tradingStatusesFormatOptionsSchema
  ).format;
}

export function createTradingStatusesCommand(
  createSdk: TradingStatusesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function tradingStatuses(argv: CliArgs): Promise<string> {
    const options = parseTradingStatusesOptions(argv);
    const request = createTradingStatusesRequest(options);
    const { format } = options;
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

function createTradingStatusesRequest(
  options: ReturnType<typeof parseTradingStatusesOptions>
): GetTradingStatusesRequest {
  return {
    instrumentId: parseCommaSeparatedStringListOption(
      options['instrument-id'],
      'instrument-id'
    )
  };
}
