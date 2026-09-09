import type { WithdrawLimitsRequest } from '../../../generated/operations';

interface WithdrawLimitsRequestOptions {
  readonly 'account-id': string;
}

export function createWithdrawLimitsRequest(
  options: WithdrawLimitsRequestOptions
): WithdrawLimitsRequest {
  return {
    accountId: options['account-id']
  };
}
