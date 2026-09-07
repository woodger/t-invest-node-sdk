/**
 * Модуль CLI-команды `market order-book`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  GetOrderBookRequest,
  type GetOrderBookResponse
} from '../../../generated/marketdata';
import { CliUsageError, type InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import {
  parseCommandOptions,
  positiveSafeIntegerOption,
  withSdkOptions
} from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatOrderBook, orderBookFormats, type OrderBookFormat } from './reporter';

type OrderBookSdk = {
  marketdata: {
    getOrderBook(request: GetOrderBookRequest): Promise<GetOrderBookResponse>;
  };
  close(): void;
};

type OrderBookSdkFactory = (options: TInvestOptions) => OrderBookSdk;

const orderBookCommandPath = ['market', 'order-book'] as const;
const defaultOrderBookSdkFactory: OrderBookSdkFactory = (options) => new TInvestNodeSDK(options);

const orderBookDepthOptionsSchema = {
  depth: {
    ...positiveSafeIntegerOption,
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

type OrderBookOptions = InferOptions<typeof orderBookOptionsSchema>;
type OrderBookRequestOptions = CommandRequestOptions<OrderBookOptions, 'instrument-id' | 'depth'>;

export function parseOrderBookDepth(rawOptions: CommandRawOptions): number {
  try {
    return parseCommandOptions(rawOptions, orderBookDepthOptionsSchema).depth;
  }
  catch (error) {
    throw normalizeOrderBookDepthError(error);
  }
}


export function parseOrderBookFormat(rawOptions: CommandRawOptions): OrderBookFormat {
  return parseCommandOptions(rawOptions, orderBookFormatOptionsSchema).format;
}

export function createOrderBookCommand(
  createSdk: OrderBookSdkFactory = defaultOrderBookSdkFactory
) {
  return command.define({
    path: orderBookCommandPath,
    options: orderBookOptionsSchema,
    handle({ options }) {
      return runOrderBookCommand(options, createSdk);
    }
  });
}

export const orderBookCommand = createOrderBookCommand();

async function runOrderBookCommand(
  options: OrderBookOptions,
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

export function createOrderBookRequest(
  options: OrderBookRequestOptions
): GetOrderBookRequest {
  return GetOrderBookRequest.create({
    instrumentId: options['instrument-id'],
    depth: options.depth
  });
}

function normalizeOrderBookDepthError(error: unknown): Error {
  if (
    error instanceof Error
    && error.message.startsWith("Expected '--depth'")
  ) {
    return new CliUsageError("Expected '--depth' as positive integer");
  }

  return error instanceof Error ? error : new Error(String(error));
}
