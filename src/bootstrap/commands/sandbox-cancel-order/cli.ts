/**
 * Модуль CLI-команды `sandbox order cancel`.
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
  CancelOrderRequest,
  CancelOrderResponse
} from '../../../generated/orders';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createCancelOrderRequest } from '../cancel-order/cli';
import {
  cancelOrderFormats,
  formatCancelOrder,
  type CancelOrderFormat
} from '../cancel-order/reporter';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';

type SandboxCancelOrderSdk = {
  sandbox: {
    cancelSandboxOrder(request: CancelOrderRequest): Promise<CancelOrderResponse>;
  };
  close(): void;
};

type SandboxCancelOrderSdkFactory = (options: TInvestOptions) => SandboxCancelOrderSdk;

const sandboxCancelOrderCommandPath = ['sandbox', 'order', 'cancel'] as const;
const defaultSandboxCancelOrderSdkFactory: SandboxCancelOrderSdkFactory = (options) => new TInvestNodeSDK(options);

const sandboxCancelOrderRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  'order-id': {
    type: 'string',
    required: true
  }
} as const;

const sandboxCancelOrderFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: cancelOrderFormats,
    default: 'table'
  }
} as const;

const sandboxCancelOrderOptionsSchema = withSdkOptions(
  sandboxCancelOrderRequestOptionsSchema,
  sideEffectConfirmationOptionsSchema,
  sandboxCancelOrderFormatOptionsSchema
);

type SandboxCancelOrderOptions = InferOptions<typeof sandboxCancelOrderOptionsSchema>;
type SandboxCancelOrderRequestOptions = CommandRequestOptions<
  SandboxCancelOrderOptions,
  'account-id' | 'order-id'
>;

export function parseSandboxCancelOrderFormat(rawOptions: CommandRawOptions): CancelOrderFormat {
  return parseCommandOptions(rawOptions, sandboxCancelOrderFormatOptionsSchema).format;
}

export function createSandboxCancelOrderCommand(
  createSdk: SandboxCancelOrderSdkFactory = defaultSandboxCancelOrderSdkFactory
) {
  return command.define({
    path: sandboxCancelOrderCommandPath,
    options: sandboxCancelOrderOptionsSchema,
    handle({ options }) {
      return runSandboxCancelOrderCommand(options, createSdk);
    }
  });
}

export const sandboxCancelOrderCommand = createSandboxCancelOrderCommand();

async function runSandboxCancelOrderCommand(
  options: SandboxCancelOrderOptions,
  createSdk: SandboxCancelOrderSdkFactory
): Promise<string> {
  assertSideEffectConfirmed(options.confirm);

  const request = createSandboxCancelOrderRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.sandbox.cancelSandboxOrder(request);

    return formatCancelOrder(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatCancelOrder };

export function createSandboxCancelOrderRequest(
  options: SandboxCancelOrderRequestOptions
): CancelOrderRequest {
  return createCancelOrderRequest(options);
}
