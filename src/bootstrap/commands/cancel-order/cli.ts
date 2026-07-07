/**
 * Модуль CLI-команды `order cancel-order`.
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
  CancelOrderRequest,
  CancelOrderResponse
} from '../../../generated/orders';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import {
  cancelOrderFormats,
  formatCancelOrder,
  type CancelOrderFormat
} from './reporter';

type CancelOrderSdk = {
  orders: {
    cancelOrder(request: CancelOrderRequest): Promise<CancelOrderResponse>;
  };
  close(): void;
};

type CancelOrderSdkFactory = (options: TinkoffInvestOptions) => CancelOrderSdk;

const cancelOrderCommandPath = ['order', 'cancel-order'] as const;
const defaultCancelOrderSdkFactory: CancelOrderSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const cancelOrderRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  'order-id': {
    type: 'string',
    required: true
  }
} as const;

const cancelOrderFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: cancelOrderFormats,
    default: 'table'
  }
} as const;

const cancelOrderOptionsSchema = withSdkOptions(
  cancelOrderRequestOptionsSchema,
  sideEffectConfirmationOptionsSchema,
  cancelOrderFormatOptionsSchema
);

type CancelOrderOptions = InferOptions<typeof cancelOrderOptionsSchema>;
type CancelOrderRequestOptions = CommandRequestOptions<
  CancelOrderOptions,
  'account-id' | 'order-id'
>;

export function parseCancelOrderFormat(rawOptions: CommandRawOptions): CancelOrderFormat {
  return parseCommandOptions(rawOptions, cancelOrderFormatOptionsSchema).format;
}

export function createCancelOrderCommand(
  createSdk: CancelOrderSdkFactory = defaultCancelOrderSdkFactory
) {
  return command.define({
    path: cancelOrderCommandPath,
    options: cancelOrderOptionsSchema,
    handle({ options }) {
      return runCancelOrderCommand(options, createSdk);
    }
  });
}

export const cancelOrderCommand = createCancelOrderCommand();

async function runCancelOrderCommand(
  options: CancelOrderOptions,
  createSdk: CancelOrderSdkFactory
): Promise<string> {
  assertSideEffectConfirmed(options.confirm);

  const request = createCancelOrderRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.orders.cancelOrder(request);

    return formatCancelOrder(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatCancelOrder };

export function createCancelOrderRequest(
  options: CancelOrderRequestOptions
): CancelOrderRequest {
  return {
    accountId: options['account-id'],
    orderId: options['order-id']
  };
}
