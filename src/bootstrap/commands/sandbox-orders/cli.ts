/**
 * Модуль CLI-команды `sandbox order list`.
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
  GetOrdersRequest,
  GetOrdersResponse
} from '../../../generated/orders';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createOrdersRequest } from '../orders/request.mapper';
import { formatOrders, ordersFormats } from '../orders/reporter';

type SandboxOrdersSdk = {
  sandbox: {
    getSandboxOrders(request: GetOrdersRequest): Promise<GetOrdersResponse>;
  };
  close(): void;
};

type SandboxOrdersSdkFactory = (options: TInvestOptions) => SandboxOrdersSdk;

export function createSandboxOrdersCommand(
  createSdk: SandboxOrdersSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['sandbox', 'order', 'list'] as const,
    options: withSdkOptions({
      'account-id': {
        type: 'string',
        required: true
      },
      format: {
        type: 'string',
        choices: ordersFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const request = createOrdersRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.sandbox.getSandboxOrders(request);

        return formatOrders(response, format);
      });
    }
  });
}

export const sandboxOrdersCommand = createSandboxOrdersCommand();
