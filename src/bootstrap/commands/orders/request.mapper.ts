import type { GetOrdersRequest } from '../../../generated/orders';

interface OrdersRequestOptions {
  readonly 'account-id': string;
}

export function createOrdersRequest(
  options: OrdersRequestOptions
): GetOrdersRequest {
  return {
    accountId: options['account-id']
  };
}
