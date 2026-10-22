/**
 * Модуль CLI-команды `sandbox order cancel`.
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
import type { CancelOrderRequest, CancelOrderResponse } from '../../../generated/orders';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
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

type SandboxCancelOrderSdkFactory = (
  options: TInvestOptions
) => SandboxCancelOrderSdk;

export function createSandboxCancelOrderCommand(
  createSdk: SandboxCancelOrderSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['sandbox', 'order', 'cancel'] as const,
    options: withSdkOptions({
      'account-id': {
        type: 'string',
        required: true
      },
      'order-id': {
        type: 'string',
        required: true
      },
      ...sideEffectConfirmationOptionsSchema,
      format: {
        type: 'string',
        choices: cancelOrderFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      assertSideEffectConfirmed(options.confirm);

      const request = createCancelOrderRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.sandbox.cancelSandboxOrder(request);

        return formatCancelOrder(response, format);
      });
    }
  });
}

export const sandboxCancelOrderCommand = createSandboxCancelOrderCommand();
