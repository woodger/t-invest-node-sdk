/**
 * Модуль CLI-команды `sandbox open-sandbox-account`.
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
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-options';
import { parseCommandOptions, withSdkOptions } from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../side-effect-args';
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

const sandboxOpenAccountCommandPath = ['sandbox', 'open-sandbox-account'] as const;
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
