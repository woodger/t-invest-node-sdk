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

type AccountOutput = {
  id: string;
  name: string;
  type: string;
  status: string;
  accessLevel: string;
  openedDate: string;
  closedDate: string;
};

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

function toAccountOutput(account: Account): AccountOutput {
  return {
    id: account.id,
    name: account.name,
    type: accountTypeToJSON(account.type),
    status: accountStatusToJSON(account.status),
    accessLevel: accessLevelToJSON(account.accessLevel),
    openedDate: formatDate(account.openedDate),
    closedDate: formatDate(account.closedDate)
  };
}

function renderTable(rows: string[][]): string {
  const widths = rows[0].map((_, columnIndex) =>
    Math.max(...rows.map((row) => row[columnIndex].length))
  );

  return [
    ...rows.map((row) =>
      row
        .map((value, columnIndex) => value.padEnd(widths[columnIndex]))
        .join('  ')
        .trimEnd()
    ),
    ''
  ].join('\n');
}

export function parseAccountsFormat(argv: CliArgs): AccountsFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', accountsFormatValues) ?? 'table';
}

export function formatAccounts(accounts: Account[], format: AccountsFormat): string {
  const output = accounts.map(toAccountOutput);

  if (format === 'json') {
    return `${JSON.stringify(output, null, 2)}\n`;
  }

  return renderTable([
    ['id', 'name', 'type', 'status', 'accessLevel', 'openedDate', 'closedDate'],
    ...output.map((account) => [
      account.id,
      account.name,
      account.type,
      account.status,
      account.accessLevel,
      account.openedDate,
      account.closedDate
    ])
  ]);
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
