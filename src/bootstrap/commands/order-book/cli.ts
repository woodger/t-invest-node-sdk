import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetOrderBookRequest,
  GetOrderBookResponse
} from '../../../generated/marketdata';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatOrderBook, orderBookFormats, type OrderBookFormat } from './reporter';

type OrderBookSdk = {
  marketdata: {
    getOrderBook(request: GetOrderBookRequest): Promise<GetOrderBookResponse>;
  };
  close(): void;
};

type OrderBookSdkFactory = (options: TinkoffInvestOptions) => OrderBookSdk;

const orderBookArgNames = new Set([
  ...sdkOptionArgNames,
  'instrument-id',
  'depth',
  'format'
]);

export function parseOrderBookDepth(argv: CliArgs): number {
  const rawValue = ArgGuards.requireStringArg(argv, 'depth');

  if (!/^\d+$/.test(rawValue)) {
    throw new Error("Expected '--depth' as positive integer");
  }

  const depth = Number(rawValue);

  if (!Number.isSafeInteger(depth) || depth <= 0) {
    throw new Error("Expected '--depth' as positive integer");
  }

  return depth;
}

export function parseOrderBookRequest(argv: CliArgs): GetOrderBookRequest {
  return {
    figi: '',
    instrumentId: ArgGuards.requireStringArg(argv, 'instrument-id'),
    depth: parseOrderBookDepth(argv)
  };
}

export function parseOrderBookFormat(argv: CliArgs): OrderBookFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', orderBookFormats) ?? 'table';
}

export function createOrderBookCommand(
  createSdk: OrderBookSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function orderBook(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, orderBookArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'marketdata get-order-book');

    const request = parseOrderBookRequest(argv);
    const format = parseOrderBookFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.marketdata.getOrderBook(request);

      return formatOrderBook(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const orderBook = createOrderBookCommand();

export { formatOrderBook };
