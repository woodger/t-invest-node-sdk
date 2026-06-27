import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetTradingStatusRequest,
  GetTradingStatusResponse
} from '../../../generated/marketdata';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  formatTradingStatus,
  tradingStatusFormats,
  type TradingStatusFormat
} from './reporter';

type TradingStatusSdk = {
  marketdata: {
    getTradingStatus(request: GetTradingStatusRequest): Promise<GetTradingStatusResponse>;
  };
  close(): void;
};

type TradingStatusSdkFactory = (options: TinkoffInvestOptions) => TradingStatusSdk;

const tradingStatusCommandName = 'marketdata get-trading-status';
const tradingStatusCommandPath = ['marketdata', 'get-trading-status'] as const;
const defaultTradingStatusSdkFactory: TradingStatusSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const tradingStatusRequestOptionsSchema = {
  'instrument-id': {
    type: 'string',
    required: true
  }
} as const;

const tradingStatusFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: tradingStatusFormats,
    default: 'table'
  }
} as const;

const tradingStatusOptionsSchema = withSdkOptions(
  tradingStatusRequestOptionsSchema,
  tradingStatusFormatOptionsSchema
);

function parseTradingStatusOptions(argv: CliArgs) {
  return parseCommandOptions(argv, tradingStatusCommandName, tradingStatusOptionsSchema);
}

export function parseTradingStatusRequest(argv: CliArgs): GetTradingStatusRequest {
  return createTradingStatusRequest(parseTradingStatusOptions(argv));
}

export function parseTradingStatusFormat(argv: CliArgs): TradingStatusFormat {
  return parseCommandOptions(
    argv,
    tradingStatusCommandName,
    tradingStatusFormatOptionsSchema
  ).format;
}

export function createTradingStatusCommand(
  createSdk: TradingStatusSdkFactory = defaultTradingStatusSdkFactory
) {
  return defineCommand({
    path: tradingStatusCommandPath,
    options: tradingStatusOptionsSchema,
    handle({ options }) {
      return runTradingStatusCommand(options, createSdk);
    }
  });
}

export const tradingStatusCommand = createTradingStatusCommand();

async function runTradingStatusCommand(
  options: ReturnType<typeof parseTradingStatusOptions>,
  createSdk: TradingStatusSdkFactory
): Promise<string> {
  const request = createTradingStatusRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.marketdata.getTradingStatus(request);

    return formatTradingStatus(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatTradingStatus };

function createTradingStatusRequest(
  options: ReturnType<typeof parseTradingStatusOptions>
): GetTradingStatusRequest {
  return {
    figi: '',
    instrumentId: options['instrument-id']
  };
}
