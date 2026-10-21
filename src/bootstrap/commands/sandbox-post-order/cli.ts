/**
 * Модуль CLI-команды `sandbox order place`.
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
  PostOrderRequest,
  PostOrderResponse
} from '../../../generated/orders';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import {
  positiveSafeIntegerOption,
  withSdkOptions
} from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createPostOrderRequest } from '../post-order/request.mapper';
import { formatPostOrder, postOrderFormats } from '../post-order/reporter';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';

type SandboxPostOrderSdk = {
  sandbox: {
    postSandboxOrder(request: PostOrderRequest): Promise<PostOrderResponse>;
  };
  close(): void;
};

type SandboxPostOrderSdkFactory = (
  options: TInvestOptions
) => SandboxPostOrderSdk;

export function createSandboxPostOrderCommand(
  createSdk: SandboxPostOrderSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['sandbox', 'order', 'place'] as const,
    options: withSdkOptions({
      'account-id': {
        type: 'string',
        required: true
      },
      'instrument-id': {
        type: 'string',
        required: true
      },
      quantity: {
        ...positiveSafeIntegerOption,
        required: true
      },
      price: {
        type: 'string'
      },
      direction: {
        type: 'string',
        choices: ['buy', 'sell'],
        required: true
      },
      'order-type': {
        type: 'string',
        choices: ['limit', 'market', 'bestprice'],
        required: true
      },
      'order-id': {
        type: 'string',
        required: true
      },
      ...sideEffectConfirmationOptionsSchema,
      format: {
        type: 'string',
        choices: postOrderFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      assertSideEffectConfirmed(options.confirm);

      const request = createPostOrderRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.sandbox.postSandboxOrder(request);

        return formatPostOrder(response, format);
      });
    }
  });
}

export const sandboxPostOrderCommand = createSandboxPostOrderCommand();
