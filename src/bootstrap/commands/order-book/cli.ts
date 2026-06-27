import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetOrderBookRequest,
  GetOrderBookResponse
} from '../../../generated/marketdata';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
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

const orderBookCommandName = 'marketdata get-order-book';
const orderBookCommandPath = ['marketdata', 'get-order-book'] as const;
const defaultOrderBookSdkFactory: OrderBookSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

const orderBookRequestOptionsSchema = {
  'instrument-id': {
    type: 'string',
    required: true
  },
  ...orderBookDepthOptionsSchema
} as const;

const orderBookOptionsSchema = withSdkOptions(
  orderBookRequestOptionsSchema,
  orderBookFormatOptionsSchema
);

function parseOrderBookOptions(argv: CliArgs) {
  try {
    return parseCommandOptions(argv, orderBookCommandName, orderBookOptionsSchema);
  }
  catch (error) {
    throw normalizeOrderBookDepthError(error);
  }
}

export function parseOrderBookDepth(argv: CliArgs): number {
  try {
    return parseCommandOptions(
      argv,
      orderBookCommandName,
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
    orderBookCommandName,
    orderBookFormatOptionsSchema
  ).format;
}

export function createOrderBookCommand(
  createSdk: OrderBookSdkFactory = defaultOrderBookSdkFactory
) {
  return defineCommand({
    path: orderBookCommandPath,
    options: orderBookOptionsSchema,
    handle({ options }) {
      return runOrderBookCommand(options, createSdk);
    }
  });
}

export function orderBook(argv: CliArgs): Promise<string> {
  return runOrderBookCommand(
    parseOrderBookOptions(argv),
    defaultOrderBookSdkFactory
  );
}

export const orderBookCommand = createOrderBookCommand();

async function runOrderBookCommand(
  options: ReturnType<typeof parseOrderBookOptions>,
  createSdk: OrderBookSdkFactory
): Promise<string> {
  const request = createOrderBookRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.marketdata.getOrderBook(request);

    return formatOrderBook(response, format);
  }
  finally {
    sdk.close();
  }
}

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
