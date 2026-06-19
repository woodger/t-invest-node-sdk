import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  accessLevelToJSON,
  accountStatusToJSON,
  accountTypeToJSON,
  type Account,
  type GetAccountsResponse
} from '../../../generated/users';

type AccountsFormat = 'json' | 'table';

type AccountsSdk = {
  users: {
    getAccounts(request: Record<string, never>): Promise<GetAccountsResponse>;
  };
  close(): void;
};

type AccountsSdkFactory = (options: TinkoffInvestOptions) => AccountsSdk;

const accountsFormatValues = ['json', 'table'] as const;
const accountsArgNames = new Set([
  ...sdkOptionArgNames,
  'format'
]);

function formatDate(value: Date | undefined): string {
  return value?.toISOString() ?? '';
}

export function parseAccountsFormat(argv: CliArgs): AccountsFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', accountsFormatValues) ?? 'table';
}

export function formatAccounts(accounts: Account[], format: AccountsFormat): string {
  if (format === 'json') {
    return `${JSON.stringify(accounts, null, 2)}\n`;
  }

  return [
    'id\tname\ttype\tstatus\taccessLevel\topenedDate\tclosedDate',
    ...accounts.map((account) => [
      account.id,
      account.name,
      accountTypeToJSON(account.type),
      accountStatusToJSON(account.status),
      accessLevelToJSON(account.accessLevel),
      formatDate(account.openedDate),
      formatDate(account.closedDate)
    ].join('\t')),
    ''
  ].join('\n');
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
