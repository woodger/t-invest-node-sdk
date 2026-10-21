/**
 * Модуль CLI-команды `sandbox account list`.
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
  GetAccountsRequest,
  GetAccountsResponse
} from '../../../generated/users';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { accountsFormats, formatAccounts } from '../accounts/reporter';

type SandboxAccountsSdk = {
  sandbox: {
    getSandboxAccounts(
      request: GetAccountsRequest
    ): Promise<GetAccountsResponse>;
  };
  close(): void;
};

type SandboxAccountsSdkFactory = (
  options: TInvestOptions
) => SandboxAccountsSdk;

export function createSandboxAccountsCommand(
  createSdk: SandboxAccountsSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['sandbox', 'account', 'list'] as const,
    options: withSdkOptions({
      format: {
        type: 'string',
        choices: accountsFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.sandbox.getSandboxAccounts({});

        return formatAccounts(response.accounts, format);
      });
    }
  });
}

export const sandboxAccountsCommand = createSandboxAccountsCommand();
