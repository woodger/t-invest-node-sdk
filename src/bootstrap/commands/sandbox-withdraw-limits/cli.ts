import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  WithdrawLimitsRequest,
  WithdrawLimitsResponse
} from '../../../generated/operations';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../command-options';
import { parseCommandOptions, withSdkOptions } from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { createWithdrawLimitsRequest } from '../withdraw-limits/cli';
import {
  formatWithdrawLimits,
  withdrawLimitsFormats,
  type WithdrawLimitsFormat
} from '../withdraw-limits/reporter';

type SandboxWithdrawLimitsSdk = {
  sandbox: {
    getSandboxWithdrawLimits(request: WithdrawLimitsRequest): Promise<WithdrawLimitsResponse>;
  };
  close(): void;
};

type SandboxWithdrawLimitsSdkFactory = (
  options: TinkoffInvestOptions
) => SandboxWithdrawLimitsSdk;

const sandboxWithdrawLimitsCommandPath = ['sandbox', 'get-sandbox-withdraw-limits'] as const;
const defaultSandboxWithdrawLimitsSdkFactory: SandboxWithdrawLimitsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const sandboxWithdrawLimitsRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  }
} as const;

const sandboxWithdrawLimitsFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: withdrawLimitsFormats,
    default: 'table'
  }
} as const;

const sandboxWithdrawLimitsOptionsSchema = withSdkOptions(
  sandboxWithdrawLimitsRequestOptionsSchema,
  sandboxWithdrawLimitsFormatOptionsSchema
);

type SandboxWithdrawLimitsOptions = InferOptions<typeof sandboxWithdrawLimitsOptionsSchema>;
type SandboxWithdrawLimitsRequestOptions = CommandRequestOptions<
  SandboxWithdrawLimitsOptions,
  'account-id'
>;

export function parseSandboxWithdrawLimitsFormat(
  rawOptions: CommandRawOptions
): WithdrawLimitsFormat {
  return parseCommandOptions(rawOptions, sandboxWithdrawLimitsFormatOptionsSchema).format;
}

export function createSandboxWithdrawLimitsCommand(
  createSdk: SandboxWithdrawLimitsSdkFactory = defaultSandboxWithdrawLimitsSdkFactory
) {
  return defineCommand({
    path: sandboxWithdrawLimitsCommandPath,
    options: sandboxWithdrawLimitsOptionsSchema,
    handle({ options }) {
      return runSandboxWithdrawLimitsCommand(options, createSdk);
    }
  });
}

export const sandboxWithdrawLimitsCommand = createSandboxWithdrawLimitsCommand();

async function runSandboxWithdrawLimitsCommand(
  options: SandboxWithdrawLimitsOptions,
  createSdk: SandboxWithdrawLimitsSdkFactory
): Promise<string> {
  const request = createSandboxWithdrawLimitsRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.sandbox.getSandboxWithdrawLimits(request);

    return formatWithdrawLimits(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatWithdrawLimits };

export function createSandboxWithdrawLimitsRequest(
  options: SandboxWithdrawLimitsRequestOptions
): WithdrawLimitsRequest {
  return createWithdrawLimitsRequest(options);
}
