/**
 * Модуль CLI-команды `sandbox withdraw-limits`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - переиспользование общего production/Sandbox request mapper-а;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  WithdrawLimitsRequest,
  WithdrawLimitsResponse
} from '../../../generated/operations';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createWithdrawLimitsRequest } from '../withdraw-limits/request.mapper';
import {
  formatWithdrawLimits,
  withdrawLimitsFormats
} from '../withdraw-limits/reporter';

type SandboxWithdrawLimitsSdk = {
  sandbox: {
    getSandboxWithdrawLimits(
      request: WithdrawLimitsRequest
    ): Promise<WithdrawLimitsResponse>;
  };
  close(): void;
};

type SandboxWithdrawLimitsSdkFactory = (
  options: TInvestOptions
) => SandboxWithdrawLimitsSdk;

export function createSandboxWithdrawLimitsCommand(
  createSdk: SandboxWithdrawLimitsSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['sandbox', 'withdraw-limits'] as const,
    options: withSdkOptions({
      'account-id': {
        type: 'string',
        required: true
      },
      format: {
        type: 'string',
        choices: withdrawLimitsFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const request = createWithdrawLimitsRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.sandbox.getSandboxWithdrawLimits(request);

        return formatWithdrawLimits(response, format);
      });
    }
  });
}

export const sandboxWithdrawLimitsCommand =
  createSandboxWithdrawLimitsCommand();
