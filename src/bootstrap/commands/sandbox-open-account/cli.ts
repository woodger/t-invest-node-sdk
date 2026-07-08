/**
 * Модуль CLI-команды `sandbox account open`.
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
  OpenSandboxAccountRequest,
  OpenSandboxAccountResponse
} from '../../../generated/sandbox';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import {
  formatOpenSandboxAccount,
  openSandboxAccountFormats,
  type OpenSandboxAccountFormat
} from './reporter';

type SandboxOpenAccountSdk = {
  sandbox: {
    openSandboxAccount(request: OpenSandboxAccountRequest): Promise<OpenSandboxAccountResponse>;
  };
  close(): void;
};

type SandboxOpenAccountSdkFactory = (options: TinkoffInvestOptions) => SandboxOpenAccountSdk;

const sandboxOpenAccountCommandPath = ['sandbox', 'account', 'open'] as const;
const defaultSandboxOpenAccountSdkFactory: SandboxOpenAccountSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const sandboxOpenAccountFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: openSandboxAccountFormats,
    default: 'table'
  }
} as const;

const sandboxOpenAccountOptionsSchema = withSdkOptions(
  sideEffectConfirmationOptionsSchema,
  sandboxOpenAccountFormatOptionsSchema
);

type SandboxOpenAccountOptions = InferOptions<typeof sandboxOpenAccountOptionsSchema>;

export function parseSandboxOpenAccountFormat(
  rawOptions: CommandRawOptions
): OpenSandboxAccountFormat {
  return parseCommandOptions(rawOptions, sandboxOpenAccountFormatOptionsSchema).format;
}

export function createSandboxOpenAccountCommand(
  createSdk: SandboxOpenAccountSdkFactory = defaultSandboxOpenAccountSdkFactory
) {
  return command.define({
    path: sandboxOpenAccountCommandPath,
    options: sandboxOpenAccountOptionsSchema,
    handle({ options }) {
      return runSandboxOpenAccountCommand(options, createSdk);
    }
  });
}

export const sandboxOpenAccountCommand = createSandboxOpenAccountCommand();

async function runSandboxOpenAccountCommand(
  options: SandboxOpenAccountOptions,
  createSdk: SandboxOpenAccountSdkFactory
): Promise<string> {
  assertSideEffectConfirmed(options.confirm);

  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.sandbox.openSandboxAccount(createSandboxOpenAccountRequest());

    return formatOpenSandboxAccount(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatOpenSandboxAccount };

export function createSandboxOpenAccountRequest(): OpenSandboxAccountRequest {
  return {};
}
