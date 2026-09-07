/**
 * Модуль CLI-команды `sandbox pay-in`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  SandboxPayInRequest,
  SandboxPayInResponse
} from '../../../generated/sandbox';
import { CliUsageError, type InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  parsePositiveQuotationOption,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import { formatSandboxPayIn, sandboxPayInFormats } from './reporter';

type SandboxPayInSdk = {
  sandbox: {
    sandboxPayIn(request: SandboxPayInRequest): Promise<SandboxPayInResponse>;
  };
  close(): void;
};

type SandboxPayInSdkFactory = (options: TInvestOptions) => SandboxPayInSdk;

const sandboxPayInCommandPath = ['sandbox', 'pay-in'] as const;
const defaultSandboxPayInSdkFactory: SandboxPayInSdkFactory = (options) => new TInvestNodeSDK(options);

const sandboxPayInCurrencies = ['rub', 'usd'] as const;

const sandboxPayInRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  amount: {
    type: 'string',
    required: true
  },
  currency: {
    type: 'string',
    choices: sandboxPayInCurrencies,
    default: 'rub'
  }
} as const;

const sandboxPayInFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: sandboxPayInFormats,
    default: 'table'
  }
} as const;

const sandboxPayInOptionsSchema = withSdkOptions(
  sandboxPayInRequestOptionsSchema,
  sideEffectConfirmationOptionsSchema,
  sandboxPayInFormatOptionsSchema
);

type SandboxPayInOptions = InferOptions<typeof sandboxPayInOptionsSchema>;
type SandboxPayInRequestOptions = CommandRequestOptions<
  SandboxPayInOptions,
  'account-id' | 'amount' | 'currency'
>;

export function createSandboxPayInCommand(
  createSdk: SandboxPayInSdkFactory = defaultSandboxPayInSdkFactory
) {
  return command.define({
    path: sandboxPayInCommandPath,
    options: sandboxPayInOptionsSchema,
    handle({ options }) {
      return runSandboxPayInCommand(options, createSdk);
    }
  });
}

export const sandboxPayInCommand = createSandboxPayInCommand();

async function runSandboxPayInCommand(
  options: SandboxPayInOptions,
  createSdk: SandboxPayInSdkFactory
): Promise<string> {
  assertSideEffectConfirmed(options.confirm);

  const request = createSandboxPayInRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.sandbox.sandboxPayIn(request);

    return formatSandboxPayIn(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatSandboxPayIn };

export function createSandboxPayInRequest(
  options: SandboxPayInRequestOptions
): SandboxPayInRequest {
  if (options.currency === 'usd') {
    throw new CliUsageError("Unsupported '--currency=usd' for sandbox-pay-in");
  }

  const amount = parsePositiveQuotationOption(options.amount, 'amount');

  return {
    accountId: options['account-id'],
    amount: {
      units: amount.units,
      nano: amount.nano,
      currency: options.currency
    }
  };
}
