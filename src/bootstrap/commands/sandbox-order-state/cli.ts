/**
 * Модуль CLI-команды `sandbox order show`.
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
import type { GetOrderStateRequest, OrderState } from '../../../generated/orders';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createOrderStateRequest } from '../order-state/request.mapper';
import { formatOrderState, orderStateFormats } from '../order-state/reporter';

type SandboxOrderStateSdk = {
  sandbox: {
    getSandboxOrderState(request: GetOrderStateRequest): Promise<OrderState>;
  };
  close(): void;
};

type SandboxOrderStateSdkFactory = (
  options: TInvestOptions
) => SandboxOrderStateSdk;

export function createSandboxOrderStateCommand(
  createSdk: SandboxOrderStateSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['sandbox', 'order', 'show'] as const,
    options: withSdkOptions({
      'account-id': {
        type: 'string',
        required: true
      },
      'order-id': {
        type: 'string',
        required: true
      },
      format: {
        type: 'string',
        choices: orderStateFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const request = createOrderStateRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.sandbox.getSandboxOrderState(request);

        return formatOrderState(response, format);
      });
    }
  });
}

export const sandboxOrderStateCommand = createSandboxOrderStateCommand();
