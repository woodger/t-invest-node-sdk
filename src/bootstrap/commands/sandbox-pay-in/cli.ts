/**
 * Модуль CLI-команды `sandbox pay-in`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { SandboxPayInRequest, SandboxPayInResponse } from '../../../generated/sandbox';
import { CliUsageError, type InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
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

type SandboxPayInOptions = InferOptions<typeof sandboxPayInOptionsSchema>;
type SandboxPayInRequestOptions = CommandRequestOptions<
  SandboxPayInOptions,
  'account-id' | 'amount' | 'currency'
>;

const sandboxPayInCurrencies = ['rub', 'usd'] as const;

const sandboxPayInOptionsSchema = withSdkOptions({
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
  },
  ...sideEffectConfirmationOptionsSchema,
  format: {
    type: 'string',
    choices: sandboxPayInFormats,
    default: 'table'
  }
});

export function createSandboxPayInCommand(
  createSdk: SandboxPayInSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['sandbox', 'pay-in'] as const,
    options: sandboxPayInOptionsSchema,
    async handle({ options }) {
      assertSideEffectConfirmed(options.confirm);

      const request = createSandboxPayInRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.sandbox.sandboxPayIn(request);

        return formatSandboxPayIn(response, format);
      });
    }
  });
}

export const sandboxPayInCommand = createSandboxPayInCommand();

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
