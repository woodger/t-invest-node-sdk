/**
 * Модуль CLI-команды `order place`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import { PriceType } from '../../../generated/common';
import {
  OrderDirection,
  OrderType,
  PostOrderRequest,
  TimeInForceType,
  type PostOrderResponse
} from '../../../generated/orders';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import {
  parseCommandOptions,
  positiveSafeIntegerOption,
  withSdkOptions
} from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  parseOptionalPositiveQuotationOption,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import { formatPostOrder, postOrderFormats, type PostOrderFormat } from './reporter';

type PostOrderSdk = {
  orders: {
    postOrder(request: PostOrderRequest): Promise<PostOrderResponse>;
  };
  close(): void;
};

type PostOrderSdkFactory = (options: TInvestOptions) => PostOrderSdk;

const postOrderCommandPath = ['order', 'place'] as const;
const defaultPostOrderSdkFactory: PostOrderSdkFactory = (options) => new TInvestNodeSDK(options);

const postOrderDirections = {
  buy: OrderDirection.ORDER_DIRECTION_BUY,
  sell: OrderDirection.ORDER_DIRECTION_SELL
} as const;

type PostOrderDirectionName = keyof typeof postOrderDirections;

const postOrderDirectionNames = Object.keys(postOrderDirections) as PostOrderDirectionName[];

const postOrderTypes = {
  limit: OrderType.ORDER_TYPE_LIMIT,
  market: OrderType.ORDER_TYPE_MARKET,
  bestprice: OrderType.ORDER_TYPE_BESTPRICE
} as const;

type PostOrderTypeName = keyof typeof postOrderTypes;

const postOrderTypeNames = Object.keys(postOrderTypes) as PostOrderTypeName[];

const postOrderRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  'instrument-id': {
    type: 'string',
    required: true
  },
  quantity: {
    ...positiveSafeIntegerOption,
    required: true
  },
  price: {
    type: 'string'
  },
  direction: {
    type: 'string',
    choices: postOrderDirectionNames,
    required: true
  },
  'order-type': {
    type: 'string',
    choices: postOrderTypeNames,
    required: true
  },
  'order-id': {
    type: 'string',
    required: true
  }
} as const;

const postOrderFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: postOrderFormats,
    default: 'table'
  }
} as const;

const postOrderOptionsSchema = withSdkOptions(
  postOrderRequestOptionsSchema,
  sideEffectConfirmationOptionsSchema,
  postOrderFormatOptionsSchema
);

type PostOrderOptions = InferOptions<typeof postOrderOptionsSchema>;
type PostOrderRequestOptions = CommandRequestOptions<
  PostOrderOptions,
  'account-id' |
  'instrument-id' |
  'quantity' |
  'price' |
  'direction' |
  'order-type' |
  'order-id'
>;

export function parsePostOrderFormat(rawOptions: CommandRawOptions): PostOrderFormat {
  return parseCommandOptions(rawOptions, postOrderFormatOptionsSchema).format;
}

export function createPostOrderCommand(
  createSdk: PostOrderSdkFactory = defaultPostOrderSdkFactory
) {
  return command.define({
    path: postOrderCommandPath,
    options: postOrderOptionsSchema,
    handle({ options }) {
      return runPostOrderCommand(options, createSdk);
    }
  });
}

export const postOrderCommand = createPostOrderCommand();

async function runPostOrderCommand(
  options: PostOrderOptions,
  createSdk: PostOrderSdkFactory
): Promise<string> {
  assertSideEffectConfirmed(options.confirm);

  const request = createPostOrderRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.orders.postOrder(request);

    return formatPostOrder(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatPostOrder };

export function createPostOrderRequest(options: PostOrderRequestOptions): PostOrderRequest {
  return PostOrderRequest.create({
    quantity: options.quantity,
    price: parseOptionalPositiveQuotationOption(options.price, 'price'),
    direction: postOrderDirections[options.direction],
    accountId: options['account-id'],
    orderType: postOrderTypes[options['order-type']],
    orderId: options['order-id'],
    instrumentId: options['instrument-id'],
    timeInForce: TimeInForceType.TIME_IN_FORCE_UNSPECIFIED,
    priceType: PriceType.PRICE_TYPE_UNSPECIFIED,
    confirmMarginTrade: false
  });
}
