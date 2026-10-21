/**
 * Модуль CLI-команды `sandbox order replace`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - переиспользование общего production/Sandbox request mapper-а;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  PostOrderResponse,
  ReplaceOrderRequest
} from '../../../generated/orders';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import {
  positiveSafeIntegerOption,
  withSdkOptions
} from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createReplaceOrderRequest } from '../replace-order/request.mapper';
import {
  formatReplaceOrder,
  replaceOrderFormats
} from '../replace-order/reporter';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';

type SandboxReplaceOrderSdk = {
  sandbox: {
    replaceSandboxOrder(
      request: ReplaceOrderRequest
    ): Promise<PostOrderResponse>;
  };
  close(): void;
};

type SandboxReplaceOrderSdkFactory = (
  options: TInvestOptions
) => SandboxReplaceOrderSdk;

export function createSandboxReplaceOrderCommand(
  createSdk: SandboxReplaceOrderSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['sandbox', 'order', 'replace'] as const,
    options: withSdkOptions({
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
      },
      ...sideEffectConfirmationOptionsSchema,
      format: {
        type: 'string',
        choices: replaceOrderFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      assertSideEffectConfirmed(options.confirm);

      const request = createReplaceOrderRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.sandbox.replaceSandboxOrder(request);

        return formatReplaceOrder(response, format);
      });
    }
  });
}

export const sandboxReplaceOrderCommand = createSandboxReplaceOrderCommand();
