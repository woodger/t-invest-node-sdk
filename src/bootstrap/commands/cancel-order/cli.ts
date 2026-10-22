/**
 * Модуль CLI-команды `order cancel`.
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
import type { CancelOrderRequest, CancelOrderResponse } from '../../../generated/orders';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { assertSideEffectConfirmed, sideEffectConfirmationOptionsSchema } from '../../args/side-effect-args';
import { cancelOrderFormats, formatCancelOrder } from './reporter';
import { createCancelOrderRequest } from './request.mapper';

type CancelOrderSdk = {
  orders: {
    cancelOrder(request: CancelOrderRequest): Promise<CancelOrderResponse>;
  };
  close(): void;
};

type CancelOrderSdkFactory = (options: TInvestOptions) => CancelOrderSdk;

export function createCancelOrderCommand(
  createSdk: CancelOrderSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['order', 'cancel'] as const,
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
        const response = await sdk.orders.cancelOrder(request);

        return formatCancelOrder(response, format);
      });
    }
  });
}

export const cancelOrderCommand = createCancelOrderCommand();
