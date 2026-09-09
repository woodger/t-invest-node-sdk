import type { CancelOrderRequest } from '../../../generated/orders';

interface CancelOrderRequestOptions {
  readonly 'account-id': string;
  readonly 'order-id': string;
}

export function createCancelOrderRequest(
  options: CancelOrderRequestOptions
): CancelOrderRequest {
  return {
    accountId: options['account-id'],
    orderId: options['order-id']
  };
}
