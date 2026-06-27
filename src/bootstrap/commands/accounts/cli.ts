import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
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

const accountsOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: accountsFormats,
    default: 'table'
  }
} as const);

function parseAccountsOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'users get-accounts', accountsOptionsSchema);
}

export function parseAccountsFormat(argv: CliArgs): AccountsFormat {
  return parseAccountsOptions(argv).format;
}

export function createAccountsCommand(
  createSdk: AccountsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function accounts(argv: CliArgs): Promise<string> {
    const { format } = parseAccountsOptions(argv);
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
