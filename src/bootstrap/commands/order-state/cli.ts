/**
 * Модуль CLI-команды `order show`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - делегирование request mapping в command-owned mapper;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  GetOrderStateRequest,
  OrderState
} from '../../../generated/orders';
import type { InferOptions } from 'icore';
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

const orderStateCommandPath = ['order', 'show'] as const;
const defaultOrderStateSdkFactory: OrderStateSdkFactory = (options) => new TInvestNodeSDK(options);

const orderStateRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  'order-id': {
    type: 'string',
    required: true
  }
} as const;

const orderStateFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: orderStateFormats,
    default: 'table'
  }
} as const;

const orderStateOptionsSchema = withSdkOptions(
  orderStateRequestOptionsSchema,
  orderStateFormatOptionsSchema
);

type OrderStateOptions = InferOptions<typeof orderStateOptionsSchema>;
export function createOrderStateCommand(
  createSdk: OrderStateSdkFactory = defaultOrderStateSdkFactory
) {
  return command.define({
    path: orderStateCommandPath,
    options: orderStateOptionsSchema,
    handle({ options }) {
      return runOrderStateCommand(options, createSdk);
    }
  });
}

export const orderStateCommand = createOrderStateCommand();

async function runOrderStateCommand(
  options: OrderStateOptions,
  createSdk: OrderStateSdkFactory
): Promise<string> {
  const request = createOrderStateRequest(options);
  const { format } = options;
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.orders.getOrderState(request);

    return formatOrderState(response, format);
  });
}
