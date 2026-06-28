import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { defineCommand, type InferOptions } from 'icore';
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
  return defineCommand({
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
