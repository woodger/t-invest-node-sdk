/**
 * Модуль CLI-команды `account list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import type { GetAccountsResponse } from '../../../generated/users';
import { accountsFormats, formatAccounts } from './reporter';

type AccountsSdk = {
  users: {
    getAccounts(request: Record<string, never>): Promise<GetAccountsResponse>;
  };
  close(): void;
};

type AccountsSdkFactory = (options: TInvestOptions) => AccountsSdk;

const accountsCommandPath = ['account', 'list'] as const;
const defaultAccountsSdkFactory: AccountsSdkFactory = (options) => new TInvestNodeSDK(options);

const accountsOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: accountsFormats,
    default: 'table'
  }
} as const);

type AccountsOptions = InferOptions<typeof accountsOptionsSchema>;

export function createAccountsCommand(
  createSdk: AccountsSdkFactory = defaultAccountsSdkFactory
) {
  return command.define({
    path: accountsCommandPath,
    options: accountsOptionsSchema,
    handle({ options }) {
      return runAccountsCommand(options, createSdk);
    }
  });
}

export const accountsCommand = createAccountsCommand();

async function runAccountsCommand(
  options: AccountsOptions,
  createSdk: AccountsSdkFactory
): Promise<string> {
  const { format } = options;
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.users.getAccounts({});

    return formatAccounts(response.accounts, format);
  });
}
