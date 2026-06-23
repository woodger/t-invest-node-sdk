import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  WithdrawLimitsRequest,
  WithdrawLimitsResponse
} from '../../../generated/operations';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  formatWithdrawLimits,
  withdrawLimitsFormats,
  type WithdrawLimitsFormat
} from './reporter';

type WithdrawLimitsSdk = {
  operations: {
    getWithdrawLimits(request: WithdrawLimitsRequest): Promise<WithdrawLimitsResponse>;
  };
  close(): void;
};

type WithdrawLimitsSdkFactory = (options: TinkoffInvestOptions) => WithdrawLimitsSdk;

const withdrawLimitsArgNames = new Set([
  ...sdkOptionArgNames,
  'account-id',
  'format'
]);

export function parseWithdrawLimitsRequest(argv: CliArgs): WithdrawLimitsRequest {
  return {
    accountId: ArgGuards.requireStringArg(argv, 'account-id')
  };
}

export function parseWithdrawLimitsFormat(argv: CliArgs): WithdrawLimitsFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', withdrawLimitsFormats) ?? 'table';
}

export function createWithdrawLimitsCommand(
  createSdk: WithdrawLimitsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function withdrawLimits(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, withdrawLimitsArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'operations get-withdraw-limits');

    const request = parseWithdrawLimitsRequest(argv);
    const format = parseWithdrawLimitsFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.operations.getWithdrawLimits(request);

      return formatWithdrawLimits(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const withdrawLimits = createWithdrawLimitsCommand();

export { formatWithdrawLimits };
