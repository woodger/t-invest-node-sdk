import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  WithdrawLimitsRequest,
  WithdrawLimitsResponse
} from '../../../generated/operations';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
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

const withdrawLimitsCommandName = 'operations get-withdraw-limits';
const withdrawLimitsCommandPath = ['operations', 'get-withdraw-limits'] as const;
const defaultWithdrawLimitsSdkFactory: WithdrawLimitsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const withdrawLimitsRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  }
} as const;

const withdrawLimitsFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: withdrawLimitsFormats,
    default: 'table'
  }
} as const;

const withdrawLimitsOptionsSchema = withSdkOptions(
  withdrawLimitsRequestOptionsSchema,
  withdrawLimitsFormatOptionsSchema
);

function parseWithdrawLimitsOptions(argv: CliArgs) {
  return parseCommandOptions(argv, withdrawLimitsCommandName, withdrawLimitsOptionsSchema);
}

export function parseWithdrawLimitsRequest(argv: CliArgs): WithdrawLimitsRequest {
  return createWithdrawLimitsRequest(parseWithdrawLimitsOptions(argv));
}

export function parseWithdrawLimitsFormat(argv: CliArgs): WithdrawLimitsFormat {
  return parseCommandOptions(
    argv,
    withdrawLimitsCommandName,
    withdrawLimitsFormatOptionsSchema
  ).format;
}

export function createWithdrawLimitsCommand(
  createSdk: WithdrawLimitsSdkFactory = defaultWithdrawLimitsSdkFactory
) {
  return defineCommand({
    path: withdrawLimitsCommandPath,
    options: withdrawLimitsOptionsSchema,
    handle({ options }) {
      return runWithdrawLimitsCommand(options, createSdk);
    }
  });
}

export const withdrawLimitsCommand = createWithdrawLimitsCommand();

async function runWithdrawLimitsCommand(
  options: ReturnType<typeof parseWithdrawLimitsOptions>,
  createSdk: WithdrawLimitsSdkFactory
): Promise<string> {
  const request = createWithdrawLimitsRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.operations.getWithdrawLimits(request);

    return formatWithdrawLimits(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatWithdrawLimits };

function createWithdrawLimitsRequest(
  options: ReturnType<typeof parseWithdrawLimitsOptions>
): WithdrawLimitsRequest {
  return {
    accountId: options['account-id']
  };
}
