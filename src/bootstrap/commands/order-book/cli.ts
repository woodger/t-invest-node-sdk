/**
 * Модуль CLI-команды `market order-book`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import { GetOrderBookRequest, type GetOrderBookResponse } from '../../../generated/marketdata';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { positiveInt32Option, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatOrderBook, orderBookFormats } from './reporter';

type OrderBookSdk = {
  marketData: {
    getOrderBook(request: GetOrderBookRequest): Promise<GetOrderBookResponse>;
  };
  close(): void;
};

type OrderBookSdkFactory = (options: TInvestOptions) => OrderBookSdk;

type OrderBookOptions = InferOptions<typeof orderBookOptionsSchema>;
type OrderBookRequestOptions = CommandRequestOptions<OrderBookOptions, 'instrument-id' | 'depth'>;

const orderBookOptionsSchema = withSdkOptions({
  'instrument-id': {
    type: 'string',
    required: true
  },
  depth: {
    ...positiveInt32Option,
    required: true
  },
  format: {
    type: 'string',
    choices: orderBookFormats,
    default: 'table'
  }
});

export function createOrderBookCommand(
  createSdk: OrderBookSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['market', 'order-book'] as const,
    options: orderBookOptionsSchema,
    async handle({ options }) {
      const request = createOrderBookRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.marketData.getOrderBook(request);

        return formatOrderBook(response, format);
      });
    }
  });
}

export const orderBookCommand = createOrderBookCommand();

export function createOrderBookRequest(options: OrderBookRequestOptions): GetOrderBookRequest {
  return GetOrderBookRequest.create({
    instrumentId: options['instrument-id'],
    depth: options.depth
  });
}
