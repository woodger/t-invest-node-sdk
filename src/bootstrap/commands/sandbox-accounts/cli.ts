/**
 * Модуль CLI-команды `sandbox account list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { GetAccountsRequest, GetAccountsResponse } from '../../../generated/users';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { accountsFormats, formatAccounts } from '../accounts/reporter';

type SandboxAccountsSdk = {
  sandbox: {
    getSandboxAccounts(request: GetAccountsRequest): Promise<GetAccountsResponse>;
  };
  close(): void;
};

type SandboxAccountsSdkFactory = (options: TInvestOptions) => SandboxAccountsSdk;

const sandboxAccountsCommandPath = ['sandbox', 'account', 'list'] as const;
const defaultSandboxAccountsSdkFactory: SandboxAccountsSdkFactory = (options) => new TInvestNodeSDK(options);

const sandboxAccountsOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: accountsFormats,
    default: 'table'
  }
} as const);

type SandboxAccountsOptions = InferOptions<typeof sandboxAccountsOptionsSchema>;

export function createSandboxAccountsCommand(
  createSdk: SandboxAccountsSdkFactory = defaultSandboxAccountsSdkFactory
) {
  return command.define({
    path: sandboxAccountsCommandPath,
    options: sandboxAccountsOptionsSchema,
    handle({ options }) {
      return runSandboxAccountsCommand(options, createSdk);
    }
  });
}

export const sandboxAccountsCommand = createSandboxAccountsCommand();

async function runSandboxAccountsCommand(
  options: SandboxAccountsOptions,
  createSdk: SandboxAccountsSdkFactory
): Promise<string> {
  const { format } = options;
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.sandbox.getSandboxAccounts(createSandboxAccountsRequest());

    return formatAccounts(response.accounts, format);
  });
}

export function createSandboxAccountsRequest(): GetAccountsRequest {
  return {};
}
