/**
 * Модуль CLI-команды `sandbox order cancel`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - переиспользование общего production/Sandbox request mapper-а;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
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
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createCancelOrderRequest } from '../cancel-order/request.mapper';
import { cancelOrderFormats, formatCancelOrder } from '../cancel-order/reporter';
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
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.sandbox.cancelSandboxOrder(request);

    return formatCancelOrder(response, format);
  });
}

export function createSandboxCancelOrderRequest(
  options: SandboxCancelOrderRequestOptions
): CancelOrderRequest {
  return createCancelOrderRequest(options);
}
