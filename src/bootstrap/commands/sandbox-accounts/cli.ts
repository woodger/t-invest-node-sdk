/**
 * Модуль CLI-команды `sandbox get-sandbox-accounts`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetAccountsRequest, GetAccountsResponse } from '../../../generated/users';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { accountsFormats, formatAccounts, type AccountsFormat } from '../accounts/reporter';

type SandboxAccountsSdk = {
  sandbox: {
    getSandboxAccounts(request: GetAccountsRequest): Promise<GetAccountsResponse>;
  };
  close(): void;
};

type SandboxAccountsSdkFactory = (options: TinkoffInvestOptions) => SandboxAccountsSdk;

const sandboxAccountsCommandPath = ['sandbox', 'get-sandbox-accounts'] as const;
const defaultSandboxAccountsSdkFactory: SandboxAccountsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const sandboxAccountsOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: accountsFormats,
    default: 'table'
  }
} as const);

type SandboxAccountsOptions = InferOptions<typeof sandboxAccountsOptionsSchema>;

export function parseSandboxAccountsFormat(rawOptions: CommandRawOptions): AccountsFormat {
  return parseCommandOptions(rawOptions, sandboxAccountsOptionsSchema).format;
}

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
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.sandbox.getSandboxAccounts(createSandboxAccountsRequest());

    return formatAccounts(response.accounts, format);
  }
  finally {
    sdk.close();
  }
}

export { formatAccounts };

export function createSandboxAccountsRequest(): GetAccountsRequest {
  return {};
}
