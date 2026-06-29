/**
 * Модуль CLI-команды `operations get-withdraw-limits`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

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

type WithdrawLimitsOptions = InferOptions<typeof withdrawLimitsOptionsSchema>;
type WithdrawLimitsRequestOptions = CommandRequestOptions<WithdrawLimitsOptions, 'account-id'>;



export function parseWithdrawLimitsFormat(rawOptions: CommandRawOptions): WithdrawLimitsFormat {
  return parseCommandOptions(rawOptions, withdrawLimitsFormatOptionsSchema).format;
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
  options: WithdrawLimitsOptions,
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

export function createWithdrawLimitsRequest(
  options: WithdrawLimitsRequestOptions
): WithdrawLimitsRequest {
  return {
    accountId: options['account-id']
  };
}
