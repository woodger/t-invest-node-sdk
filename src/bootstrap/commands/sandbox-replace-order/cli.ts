/**
 * Модуль CLI-команды `sandbox order replace`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { PostOrderResponse, ReplaceOrderRequest } from '../../../generated/orders';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRequestOptions } from '../../args/command-options';
import { positiveSafeIntegerOption, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createReplaceOrderRequest } from '../replace-order/cli';
import { formatReplaceOrder, replaceOrderFormats } from '../replace-order/reporter';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';

type SandboxReplaceOrderSdk = {
  sandbox: {
    replaceSandboxOrder(request: ReplaceOrderRequest): Promise<PostOrderResponse>;
  };
  close(): void;
};

type SandboxReplaceOrderSdkFactory = (options: TInvestOptions) => SandboxReplaceOrderSdk;

const sandboxReplaceOrderCommandPath = ['sandbox', 'order', 'replace'] as const;
const defaultSandboxReplaceOrderSdkFactory: SandboxReplaceOrderSdkFactory = (options) => new TInvestNodeSDK(options);

const sandboxReplaceOrderRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  'order-id': {
    type: 'string',
    required: true
  },
  'idempotency-key': {
    type: 'string',
    required: true
  },
  quantity: {
    ...positiveSafeIntegerOption,
    required: true
  },
  price: {
    type: 'string',
    required: true
  },
  'price-type': {
    type: 'string',
    choices: ['point', 'currency'],
    required: true
  }
} as const;

const sandboxReplaceOrderFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: replaceOrderFormats,
    default: 'table'
  }
} as const;

const sandboxReplaceOrderOptionsSchema = withSdkOptions(
  sandboxReplaceOrderRequestOptionsSchema,
  sideEffectConfirmationOptionsSchema,
  sandboxReplaceOrderFormatOptionsSchema
);

type SandboxReplaceOrderOptions = InferOptions<typeof sandboxReplaceOrderOptionsSchema>;
type SandboxReplaceOrderRequestOptions = CommandRequestOptions<
  SandboxReplaceOrderOptions,
  'account-id' |
  'order-id' |
  'idempotency-key' |
  'quantity' |
  'price' |
  'price-type'
>;

export function createSandboxReplaceOrderCommand(
  createSdk: SandboxReplaceOrderSdkFactory = defaultSandboxReplaceOrderSdkFactory
) {
  return command.define({
    path: sandboxReplaceOrderCommandPath,
    options: sandboxReplaceOrderOptionsSchema,
    handle({ options }) {
      return runSandboxReplaceOrderCommand(options, createSdk);
    }
  });
}

export const sandboxReplaceOrderCommand = createSandboxReplaceOrderCommand();

async function runSandboxReplaceOrderCommand(
  options: SandboxReplaceOrderOptions,
  createSdk: SandboxReplaceOrderSdkFactory
): Promise<string> {
  assertSideEffectConfirmed(options.confirm);

  const request = createSandboxReplaceOrderRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.sandbox.replaceSandboxOrder(request);

    return formatReplaceOrder(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatReplaceOrder };

export function createSandboxReplaceOrderRequest(
  options: SandboxReplaceOrderRequestOptions
): ReplaceOrderRequest {
  return createReplaceOrderRequest(options);
}
