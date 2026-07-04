/**
 * Модуль CLI-команды `users get-accounts`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-options';
import { parseCommandOptions, withSdkOptions } from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import type { GetAccountsResponse } from '../../../generated/users';
import { accountsFormats, formatAccounts, type AccountsFormat } from './reporter';

type AccountsSdk = {
  users: {
    getAccounts(request: Record<string, never>): Promise<GetAccountsResponse>;
  };
  close(): void;
};

type AccountsSdkFactory = (options: TinkoffInvestOptions) => AccountsSdk;

const accountsCommandPath = ['users', 'get-accounts'] as const;
const defaultAccountsSdkFactory: AccountsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const accountsOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: accountsFormats,
    default: 'table'
  }
} as const);

type AccountsOptions = InferOptions<typeof accountsOptionsSchema>;

export function parseAccountsFormat(rawOptions: CommandRawOptions): AccountsFormat {
  return parseCommandOptions(rawOptions, accountsOptionsSchema).format;
}

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
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.users.getAccounts({});

    return formatAccounts(response.accounts, format);
  }
  finally {
    sdk.close();
  }
}

export { formatAccounts };
