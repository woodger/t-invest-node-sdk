/**
 * Модуль CLI-команды `order show`.
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
import type { GetOrderStateRequest, OrderState } from '../../../generated/orders';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatOrderState, orderStateFormats } from './reporter';
import { createOrderStateRequest } from './request.mapper';

type OrderStateSdk = {
  orders: {
    getOrderState(request: GetOrderStateRequest): Promise<OrderState>;
  };
  close(): void;
};

type OrderStateSdkFactory = (options: TInvestOptions) => OrderStateSdk;

export function createOrderStateCommand(
  createSdk: OrderStateSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['order', 'show'] as const,
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
        const response = await sdk.orders.getOrderState(request);

        return formatOrderState(response, format);
      });
    }
  });
}

export const orderStateCommand = createOrderStateCommand();
