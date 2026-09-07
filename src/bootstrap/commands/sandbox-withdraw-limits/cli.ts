/**
 * Модуль CLI-команды `sandbox withdraw-limits`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  WithdrawLimitsRequest,
  WithdrawLimitsResponse
} from '../../../generated/operations';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createWithdrawLimitsRequest } from '../withdraw-limits/cli';
import { formatWithdrawLimits, withdrawLimitsFormats } from '../withdraw-limits/reporter';

type SandboxWithdrawLimitsSdk = {
  sandbox: {
    getSandboxWithdrawLimits(request: WithdrawLimitsRequest): Promise<WithdrawLimitsResponse>;
  };
  close(): void;
};

type SandboxWithdrawLimitsSdkFactory = (
  options: TInvestOptions
) => SandboxWithdrawLimitsSdk;

const sandboxWithdrawLimitsCommandPath = ['sandbox', 'withdraw-limits'] as const;
const defaultSandboxWithdrawLimitsSdkFactory: SandboxWithdrawLimitsSdkFactory = (options) => new TInvestNodeSDK(options);

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

export function createSandboxWithdrawLimitsCommand(
  createSdk: SandboxWithdrawLimitsSdkFactory = defaultSandboxWithdrawLimitsSdkFactory
) {
  return command.define({
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
