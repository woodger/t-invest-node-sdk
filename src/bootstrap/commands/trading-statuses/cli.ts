import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetTradingStatusesRequest,
  GetTradingStatusesResponse
} from '../../../generated/marketdata';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
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

const tradingStatusesCommandName = 'marketdata get-trading-statuses';
const tradingStatusesCommandPath = ['marketdata', 'get-trading-statuses'] as const;
const defaultTradingStatusesSdkFactory: TradingStatusesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

const tradingStatusesOptionsSchema = withSdkOptions(
  tradingStatusesInstrumentIdsOptionsSchema,
  tradingStatusesFormatOptionsSchema
);

function parseTradingStatusesOptions(argv: CliArgs) {
  return parseCommandOptions(
    argv,
    tradingStatusesCommandName,
    tradingStatusesOptionsSchema
  );
}

export function parseTradingStatusesInstrumentIds(argv: CliArgs): string[] {
  const options = parseCommandOptions(
    argv,
    tradingStatusesCommandName,
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
    tradingStatusesCommandName,
    tradingStatusesFormatOptionsSchema
  ).format;
}

export function createTradingStatusesCommand(
  createSdk: TradingStatusesSdkFactory = defaultTradingStatusesSdkFactory
) {
  return defineCommand({
    path: tradingStatusesCommandPath,
    options: tradingStatusesOptionsSchema,
    handle({ options }) {
      return runTradingStatusesCommand(options, createSdk);
    }
  });
}

export const tradingStatusesCommand = createTradingStatusesCommand();

async function runTradingStatusesCommand(
  options: ReturnType<typeof parseTradingStatusesOptions>,
  createSdk: TradingStatusesSdkFactory
): Promise<string> {
  const request = createTradingStatusesRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.marketdata.getTradingStatuses(request);

    return formatTradingStatuses(response, format);
  }
  finally {
    sdk.close();
  }
}

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
