/**
 * Модуль CLI-команды `sandbox account close`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  CloseSandboxAccountRequest,
  CloseSandboxAccountResponse
} from '../../../generated/t_tech/invest/grpc/sandbox';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import {
  closeSandboxAccountFormats,
  formatCloseSandboxAccount,
  type CloseSandboxAccountFormat
} from './reporter';

type SandboxCloseAccountSdk = {
  sandbox: {
    closeSandboxAccount(request: CloseSandboxAccountRequest): Promise<CloseSandboxAccountResponse>;
  };
  close(): void;
};

type SandboxCloseAccountSdkFactory = (options: TinkoffInvestOptions) => SandboxCloseAccountSdk;

const sandboxCloseAccountCommandPath = ['sandbox', 'account', 'close'] as const;
const defaultSandboxCloseAccountSdkFactory: SandboxCloseAccountSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const sandboxCloseAccountRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  }
} as const;

const sandboxCloseAccountFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: closeSandboxAccountFormats,
    default: 'table'
  }
} as const;

const sandboxCloseAccountOptionsSchema = withSdkOptions(
  sandboxCloseAccountRequestOptionsSchema,
  sideEffectConfirmationOptionsSchema,
  sandboxCloseAccountFormatOptionsSchema
);

type SandboxCloseAccountOptions = InferOptions<typeof sandboxCloseAccountOptionsSchema>;
type SandboxCloseAccountRequestOptions = CommandRequestOptions<
  SandboxCloseAccountOptions,
  'account-id'
>;

export function parseSandboxCloseAccountFormat(
  rawOptions: CommandRawOptions
): CloseSandboxAccountFormat {
  return parseCommandOptions(rawOptions, sandboxCloseAccountFormatOptionsSchema).format;
}

export function createSandboxCloseAccountCommand(
  createSdk: SandboxCloseAccountSdkFactory = defaultSandboxCloseAccountSdkFactory
) {
  return command.define({
    path: sandboxCloseAccountCommandPath,
    options: sandboxCloseAccountOptionsSchema,
    handle({ options }) {
      return runSandboxCloseAccountCommand(options, createSdk);
    }
  });
}

export const sandboxCloseAccountCommand = createSandboxCloseAccountCommand();

async function runSandboxCloseAccountCommand(
  options: SandboxCloseAccountOptions,
  createSdk: SandboxCloseAccountSdkFactory
): Promise<string> {
  assertSideEffectConfirmed(options.confirm);

  const request = createSandboxCloseAccountRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    await sdk.sandbox.closeSandboxAccount(request);

    return formatCloseSandboxAccount(request.accountId, format);
  }
  finally {
    sdk.close();
  }
}

export { formatCloseSandboxAccount };

export function createSandboxCloseAccountRequest(
  options: SandboxCloseAccountRequestOptions
): CloseSandboxAccountRequest {
  return {
    accountId: options['account-id']
  };
}
