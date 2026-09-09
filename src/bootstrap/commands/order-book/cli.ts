/**
 * Модуль CLI-команды `market order-book`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  GetOrderBookRequest,
  type GetOrderBookResponse
} from '../../../generated/marketdata';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { positiveSafeIntegerOption, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatOrderBook, orderBookFormats } from './reporter';

type OrderBookSdk = {
  marketData: {
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
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.marketData.getOrderBook(request);

    return formatOrderBook(response, format);
  });
}

export function createOrderBookRequest(
  options: OrderBookRequestOptions
): GetOrderBookRequest {
  return GetOrderBookRequest.create({
    instrumentId: options['instrument-id'],
    depth: options.depth
  });
}
