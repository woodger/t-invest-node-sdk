import type { PositionsRequest } from '../../../generated/operations';

interface PositionsRequestOptions {
  readonly 'account-id': string;
}

export function createPositionsRequest(
  options: PositionsRequestOptions
): PositionsRequest {
  return {
    accountId: options['account-id']
  };
}
