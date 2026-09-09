/**
 * Модуль CLI-команды `operation withdraw-limits`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - делегирование request mapping в command-owned mapper;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
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
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatWithdrawLimits, withdrawLimitsFormats } from './reporter';
import { createWithdrawLimitsRequest } from './request.mapper';

type WithdrawLimitsSdk = {
  operations: {
    getWithdrawLimits(request: WithdrawLimitsRequest): Promise<WithdrawLimitsResponse>;
  };
  close(): void;
};

type WithdrawLimitsSdkFactory = (options: TInvestOptions) => WithdrawLimitsSdk;

const withdrawLimitsCommandPath = ['operation', 'withdraw-limits'] as const;
const defaultWithdrawLimitsSdkFactory: WithdrawLimitsSdkFactory = (options) => new TInvestNodeSDK(options);

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

type WithdrawLimitsOptions = InferOptions<typeof withdrawLimitsOptionsSchema>;
export function createWithdrawLimitsCommand(
  createSdk: WithdrawLimitsSdkFactory = defaultWithdrawLimitsSdkFactory
) {
  return command.define({
    path: withdrawLimitsCommandPath,
    options: withdrawLimitsOptionsSchema,
    handle({ options }) {
      return runWithdrawLimitsCommand(options, createSdk);
    }
  });
}

export const withdrawLimitsCommand = createWithdrawLimitsCommand();

async function runWithdrawLimitsCommand(
  options: WithdrawLimitsOptions,
  createSdk: WithdrawLimitsSdkFactory
): Promise<string> {
  const request = createWithdrawLimitsRequest(options);
  const { format } = options;
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.operations.getWithdrawLimits(request);

    return formatWithdrawLimits(response, format);
  });
}
