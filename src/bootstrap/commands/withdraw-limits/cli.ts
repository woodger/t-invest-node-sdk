import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  WithdrawLimitsRequest,
  WithdrawLimitsResponse
} from '../../../generated/operations';
import { resolveSdkOptions } from '../../args';
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
  return parseCommandOptions(argv, 'operations get-withdraw-limits', withdrawLimitsOptionsSchema);
}

export function parseWithdrawLimitsRequest(argv: CliArgs): WithdrawLimitsRequest {
  return createWithdrawLimitsRequest(parseWithdrawLimitsOptions(argv));
}

export function parseWithdrawLimitsFormat(argv: CliArgs): WithdrawLimitsFormat {
  return parseCommandOptions(
    argv,
    'operations get-withdraw-limits',
    withdrawLimitsFormatOptionsSchema
  ).format;
}

export function createWithdrawLimitsCommand(
  createSdk: WithdrawLimitsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function withdrawLimits(argv: CliArgs): Promise<string> {
    const options = parseWithdrawLimitsOptions(argv);
    const request = createWithdrawLimitsRequest(options);
    const { format } = options;
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

function createWithdrawLimitsRequest(
  options: ReturnType<typeof parseWithdrawLimitsOptions>
): WithdrawLimitsRequest {
  return {
    accountId: options['account-id']
  };
}
