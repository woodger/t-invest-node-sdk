/**
 * Модуль хранит request mapping, общий для production и Sandbox replace order.
 *
 * Здесь допустимы generated enum mapping и разбор цены заявки.
 * Здесь не должно быть command schema, SDK calls или rendering.
 */

import { PriceType } from '../../../generated/common';
import type { ReplaceOrderRequest } from '../../../generated/orders';
import { parsePositiveQuotationOption } from '../../args/side-effect-args';

const replaceOrderPriceTypes = {
  point: PriceType.PRICE_TYPE_POINT,
  currency: PriceType.PRICE_TYPE_CURRENCY
} as const;

interface ReplaceOrderRequestOptions {
  readonly 'account-id': string;
  readonly 'order-id': string;
  readonly 'idempotency-key': string;
  readonly quantity: number;
  readonly price: string;
  readonly 'price-type': keyof typeof replaceOrderPriceTypes;
}

export function createReplaceOrderRequest(
  options: ReplaceOrderRequestOptions
): ReplaceOrderRequest {
  return {
    accountId: options['account-id'],
    orderId: options['order-id'],
    idempotencyKey: options['idempotency-key'],
    quantity: options.quantity,
    price: parsePositiveQuotationOption(options.price, 'price'),
    priceType: replaceOrderPriceTypes[options['price-type']],
    confirmMarginTrade: false
  };
}
