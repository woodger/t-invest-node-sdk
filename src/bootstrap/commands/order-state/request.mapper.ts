/**
 * Модуль хранит request mapping, общий для production и Sandbox order state.
 *
 * Здесь допустимы generated defaults и преобразование typed command options.
 * Здесь не должно быть command schema, SDK calls или rendering.
 */

import { PriceType } from '../../../generated/common';
import type { GetOrderStateRequest } from '../../../generated/orders';

interface OrderStateRequestOptions {
  readonly 'account-id': string;
  readonly 'order-id': string;
}

export function createOrderStateRequest(
  options: OrderStateRequestOptions
): GetOrderStateRequest {
  return {
    accountId: options['account-id'],
    orderId: options['order-id'],
    priceType: PriceType.PRICE_TYPE_UNSPECIFIED
  };
}
