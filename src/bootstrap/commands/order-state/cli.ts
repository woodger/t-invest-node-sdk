/**
 * Модуль CLI-команды `orders get-order-state`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetOrderStateRequest,
  OrderState
} from '../../../generated/orders';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../command-options';
import { parseCommandOptions, withSdkOptions } from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatOrderState, orderStateFormats, type OrderStateFormat } from './reporter';

type OrderStateSdk = {
  orders: {
    getOrderState(request: GetOrderStateRequest): Promise<OrderState>;
  };
  close(): void;
};

type OrderStateSdkFactory = (options: TinkoffInvestOptions) => OrderStateSdk;

const orderStateCommandPath = ['orders', 'get-order-state'] as const;
const defaultOrderStateSdkFactory: OrderStateSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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
type OrderStateRequestOptions = CommandRequestOptions<OrderStateOptions, 'account-id' | 'order-id'>;



export function parseOrderStateFormat(rawOptions: CommandRawOptions): OrderStateFormat {
  return parseCommandOptions(rawOptions, orderStateFormatOptionsSchema).format;
}

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
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.orders.getOrderState(request);

    return formatOrderState(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatOrderState };

export function createOrderStateRequest(
  options: OrderStateRequestOptions
): GetOrderStateRequest {
  return {
    accountId: options['account-id'],
    orderId: options['order-id']
  };
}
