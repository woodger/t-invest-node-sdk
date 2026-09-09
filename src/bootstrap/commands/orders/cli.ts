/**
 * Модуль CLI-команды `order list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - делегирование request mapping в command-owned mapper;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { GetOrdersRequest, GetOrdersResponse } from '../../../generated/orders';
import type { InferOptions } from 'icore';
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

const ordersCommandPath = ['order', 'list'] as const;
const defaultOrdersSdkFactory: OrdersSdkFactory = (options) => new TInvestNodeSDK(options);

const ordersRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  }
} as const;

const ordersFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: ordersFormats,
    default: 'table'
  }
} as const;

const ordersOptionsSchema = withSdkOptions(
  ordersRequestOptionsSchema,
  ordersFormatOptionsSchema
);

type OrdersOptions = InferOptions<typeof ordersOptionsSchema>;
export function createOrdersCommand(
  createSdk: OrdersSdkFactory = defaultOrdersSdkFactory
) {
  return command.define({
    path: ordersCommandPath,
    options: ordersOptionsSchema,
    handle({ options }) {
      return runOrdersCommand(options, createSdk);
    }
  });
}

export const ordersCommand = createOrdersCommand();

async function runOrdersCommand(
  options: OrdersOptions,
  createSdk: OrdersSdkFactory
): Promise<string> {
  const request = createOrdersRequest(options);
  const { format } = options;
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.orders.getOrders(request);

    return formatOrders(response, format);
  });
}
