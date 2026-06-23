import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetLastTradesRequest,
  GetLastTradesResponse
} from '../../../generated/marketdata';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatLastTrades, lastTradesFormats, type LastTradesFormat } from './reporter';

type LastTradesSdk = {
  marketdata: {
    getLastTrades(request: GetLastTradesRequest): Promise<GetLastTradesResponse>;
  };
  close(): void;
};

type LastTradesSdkFactory = (options: TinkoffInvestOptions) => LastTradesSdk;

const lastTradesArgNames = new Set([
  ...sdkOptionArgNames,
  'instrument-id',
  'from',
  'to',
  'format'
]);

export function parseLastTradesRequest(argv: CliArgs): GetLastTradesRequest {
  const from = ArgGuards.parseDateArg(argv, 'from');
  const to = ArgGuards.parseDateArg(argv, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    figi: '',
    instrumentId: ArgGuards.requireStringArg(argv, 'instrument-id'),
    from,
    to
  };
}

export function parseLastTradesFormat(argv: CliArgs): LastTradesFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', lastTradesFormats) ?? 'table';
}

export function createLastTradesCommand(
  createSdk: LastTradesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function lastTrades(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, lastTradesArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'marketdata get-last-trades');

    const request = parseLastTradesRequest(argv);
    const format = parseLastTradesFormat(argv);
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
