import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetOrderBookRequest,
  GetOrderBookResponse
} from '../../../generated/marketdata';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatOrderBook, orderBookFormats, type OrderBookFormat } from './reporter';

type OrderBookSdk = {
  marketdata: {
    getOrderBook(request: GetOrderBookRequest): Promise<GetOrderBookResponse>;
  };
  close(): void;
};

type OrderBookSdkFactory = (options: TinkoffInvestOptions) => OrderBookSdk;

const orderBookDepthOptionsSchema = {
  depth: {
    type: 'number',
    integer: true,
    min: 1,
    required: true
  }
} as const;

const orderBookFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: orderBookFormats,
    default: 'table'
  }
} as const;

const orderBookOptionsSchema = withSdkOptions({
  'instrument-id': {
    type: 'string',
    required: true
  },
  ...orderBookDepthOptionsSchema,
  ...orderBookFormatOptionsSchema
} as const);

function parseOrderBookOptions(argv: CliArgs) {
  try {
    return parseCommandOptions(argv, 'marketdata get-order-book', orderBookOptionsSchema);
  }
  catch (error) {
    throw normalizeOrderBookDepthError(error);
  }
}

export function parseOrderBookDepth(argv: CliArgs): number {
  try {
    return parseCommandOptions(
      argv,
      'marketdata get-order-book',
      orderBookDepthOptionsSchema
    ).depth;
  }
  catch (error) {
    throw normalizeOrderBookDepthError(error);
  }
}

export function parseOrderBookRequest(argv: CliArgs): GetOrderBookRequest {
  return createOrderBookRequest(parseOrderBookOptions(argv));
}

export function parseOrderBookFormat(argv: CliArgs): OrderBookFormat {
  return parseCommandOptions(
    argv,
    'marketdata get-order-book',
    orderBookFormatOptionsSchema
  ).format;
}

export function createOrderBookCommand(
  createSdk: OrderBookSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function orderBook(argv: CliArgs): Promise<string> {
    const options = parseOrderBookOptions(argv);
    const request = createOrderBookRequest(options);
    const { format } = options;
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

function createOrderBookRequest(
  options: ReturnType<typeof parseOrderBookOptions>
): GetOrderBookRequest {
  return {
    figi: '',
    instrumentId: options['instrument-id'],
    depth: options.depth
  };
}

function normalizeOrderBookDepthError(error: unknown): Error {
  if (
    error instanceof Error
    && error.message.startsWith("Expected '--depth'")
  ) {
    return new Error("Expected '--depth' as positive integer");
  }

  return error instanceof Error ? error : new Error(String(error));
}
