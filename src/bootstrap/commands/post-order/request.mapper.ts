/**
 * Модуль хранит request mapping, общий для production и Sandbox post order.
 *
 * Здесь допустимы generated defaults, enum mapping и разбор цены заявки.
 * Здесь не должно быть command schema, SDK calls или rendering.
 */

import { PriceType } from '../../../generated/common';
import {
  OrderDirection,
  OrderType,
  PostOrderRequest,
  TimeInForceType
} from '../../../generated/orders';
import { parseOptionalPositiveQuotationOption } from '../../args/side-effect-args';

const postOrderDirections = {
  buy: OrderDirection.ORDER_DIRECTION_BUY,
  sell: OrderDirection.ORDER_DIRECTION_SELL
} as const;

const postOrderTypes = {
  limit: OrderType.ORDER_TYPE_LIMIT,
  market: OrderType.ORDER_TYPE_MARKET,
  bestprice: OrderType.ORDER_TYPE_BESTPRICE
} as const;

interface PostOrderRequestOptions {
  readonly 'account-id': string;
  readonly 'instrument-id': string;
  readonly quantity: number;
  readonly price?: string | undefined;
  readonly direction: keyof typeof postOrderDirections;
  readonly 'order-type': keyof typeof postOrderTypes;
  readonly 'order-id': string;
}

export function createPostOrderRequest(
  options: PostOrderRequestOptions
): PostOrderRequest {
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
