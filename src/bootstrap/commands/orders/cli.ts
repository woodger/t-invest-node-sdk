/**
 * Модуль CLI-команды `order list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - делегирование request mapping в command-owned mapper;
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
import { formatOrders, ordersFormats } from './reporter';
import { createOrdersRequest } from './request.mapper';

type OrdersSdk = {
  orders: {
    getOrders(request: GetOrdersRequest): Promise<GetOrdersResponse>;
  };
  close(): void;
};

type OrdersSdkFactory = (options: TInvestOptions) => OrdersSdk;

export function createOrdersCommand(
  createSdk: OrdersSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['order', 'list'] as const,
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
        const response = await sdk.orders.getOrders(request);

        return formatOrders(response, format);
      });
    }
  });
}

export const ordersCommand = createOrdersCommand();
