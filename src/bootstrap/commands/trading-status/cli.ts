import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetTradingStatusRequest,
  GetTradingStatusResponse
} from '../../../generated/marketdata';
import { resolveSdkOptions } from '../../args';
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

const tradingStatusOptionsSchema = withSdkOptions({
  ...tradingStatusRequestOptionsSchema,
  ...tradingStatusFormatOptionsSchema
} as const);

function parseTradingStatusOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'marketdata get-trading-status', tradingStatusOptionsSchema);
}

export function parseTradingStatusRequest(argv: CliArgs): GetTradingStatusRequest {
  return createTradingStatusRequest(parseTradingStatusOptions(argv));
}

export function parseTradingStatusFormat(argv: CliArgs): TradingStatusFormat {
  return parseCommandOptions(
    argv,
    'marketdata get-trading-status',
    tradingStatusFormatOptionsSchema
  ).format;
}

export function createTradingStatusCommand(
  createSdk: TradingStatusSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function tradingStatus(argv: CliArgs): Promise<string> {
    const options = parseTradingStatusOptions(argv);
    const request = createTradingStatusRequest(options);
    const { format } = options;
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.marketdata.getTradingStatus(request);

      return formatTradingStatus(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const tradingStatus = createTradingStatusCommand();

export { formatTradingStatus };

function createTradingStatusRequest(
  options: ReturnType<typeof parseTradingStatusOptions>
): GetTradingStatusRequest {
  return {
    figi: '',
    instrumentId: options['instrument-id']
  };
}
