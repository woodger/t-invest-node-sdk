/**
 * Модуль CLI-команды `sandbox account close`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { CloseSandboxAccountRequest, CloseSandboxAccountResponse } from '../../../generated/sandbox';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { assertSideEffectConfirmed, sideEffectConfirmationOptionsSchema } from '../../args/side-effect-args';
import { closeSandboxAccountFormats, formatCloseSandboxAccount } from './reporter';

type SandboxCloseAccountSdk = {
  sandbox: {
    closeSandboxAccount(
      request: CloseSandboxAccountRequest
    ): Promise<CloseSandboxAccountResponse>;
  };
  close(): void;
};

type SandboxCloseAccountSdkFactory = (
  options: TInvestOptions
) => SandboxCloseAccountSdk;

type SandboxCloseAccountOptions = InferOptions<
  typeof sandboxCloseAccountOptionsSchema
>;
type SandboxCloseAccountRequestOptions = CommandRequestOptions<
  SandboxCloseAccountOptions,
  'account-id'
>;

const sandboxCloseAccountOptionsSchema = withSdkOptions({
  'account-id': {
    type: 'string',
    required: true
  },
  ...sideEffectConfirmationOptionsSchema,
  format: {
    type: 'string',
    choices: closeSandboxAccountFormats,
    default: 'table'
  }
});

export function createSandboxCloseAccountCommand(
  createSdk: SandboxCloseAccountSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['sandbox', 'account', 'close'] as const,
    options: sandboxCloseAccountOptionsSchema,
    async handle({ options }) {
      assertSideEffectConfirmed(options.confirm);

      const request = createSandboxCloseAccountRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        await sdk.sandbox.closeSandboxAccount(request);

        return formatCloseSandboxAccount(request.accountId, format);
      });
    }
  });
}

export const sandboxCloseAccountCommand = createSandboxCloseAccountCommand();

export function createSandboxCloseAccountRequest(
  options: SandboxCloseAccountRequestOptions
): CloseSandboxAccountRequest {
  return {
    accountId: options['account-id']
  };
}
