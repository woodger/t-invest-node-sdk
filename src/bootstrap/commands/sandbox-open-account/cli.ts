/**
 * Модуль CLI-команды `sandbox account open`.
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
import type {
  OpenSandboxAccountRequest,
  OpenSandboxAccountResponse
} from '../../../generated/sandbox';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import { formatOpenSandboxAccount, openSandboxAccountFormats } from './reporter';

type SandboxOpenAccountSdk = {
  sandbox: {
    openSandboxAccount(
      request: OpenSandboxAccountRequest
    ): Promise<OpenSandboxAccountResponse>;
  };
  close(): void;
};

type SandboxOpenAccountSdkFactory = (
  options: TInvestOptions
) => SandboxOpenAccountSdk;

export function createSandboxOpenAccountCommand(
  createSdk: SandboxOpenAccountSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['sandbox', 'account', 'open'] as const,
    options: withSdkOptions({
      ...sideEffectConfirmationOptionsSchema,
      format: {
        type: 'string',
        choices: openSandboxAccountFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      assertSideEffectConfirmed(options.confirm);

      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.sandbox.openSandboxAccount({});

        return formatOpenSandboxAccount(response, format);
      });
    }
  });
}

export const sandboxOpenAccountCommand = createSandboxOpenAccountCommand();
