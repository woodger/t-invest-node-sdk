/**
 * Модуль CLI-команды `order replace`.
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
import { type PostOrderResponse, type ReplaceOrderRequest } from '../../../generated/orders';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { positiveSafeIntegerOption, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import { formatReplaceOrder, replaceOrderFormats } from './reporter';
import { createReplaceOrderRequest } from './request.mapper';

type ReplaceOrderSdk = {
  orders: {
    replaceOrder(request: ReplaceOrderRequest): Promise<PostOrderResponse>;
  };
  close(): void;
};

type ReplaceOrderSdkFactory = (options: TInvestOptions) => ReplaceOrderSdk;

const replaceOrderPriceTypeNames = ['point', 'currency'] as const;

export function createReplaceOrderCommand(
  createSdk: ReplaceOrderSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['order', 'replace'] as const,
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
        choices: replaceOrderPriceTypeNames,
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
        const response = await sdk.orders.replaceOrder(request);

        return formatReplaceOrder(response, format);
      });
    }
  });
}

export const replaceOrderCommand = createReplaceOrderCommand();
