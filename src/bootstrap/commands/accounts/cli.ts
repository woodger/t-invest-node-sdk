import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
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

const accountsArgNames = new Set([
  ...sdkOptionArgNames,
  'format'
]);

export function parseAccountsFormat(argv: CliArgs): AccountsFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', accountsFormats) ?? 'table';
}

export function createAccountsCommand(
  createSdk: AccountsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function accounts(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, accountsArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'accounts');

    const format = parseAccountsFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.users.getAccounts({});

      return formatAccounts(response.accounts, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const accounts = createAccountsCommand();

export { formatAccounts };
