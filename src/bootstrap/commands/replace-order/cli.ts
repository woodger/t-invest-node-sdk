/**
 * Модуль CLI-команды `order replace`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import { PriceType } from '../../../generated/common';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import { type PostOrderResponse, type ReplaceOrderRequest } from '../../../generated/orders';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import {
  parseCommandOptions,
  positiveSafeIntegerOption,
  withSdkOptions
} from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  parsePositiveQuotationOption,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import {
  formatReplaceOrder,
  replaceOrderFormats,
  type ReplaceOrderFormat
} from './reporter';

type ReplaceOrderSdk = {
  orders: {
    replaceOrder(request: ReplaceOrderRequest): Promise<PostOrderResponse>;
  };
  close(): void;
};

type ReplaceOrderSdkFactory = (options: TInvestOptions) => ReplaceOrderSdk;

const replaceOrderCommandPath = ['order', 'replace'] as const;
const defaultReplaceOrderSdkFactory: ReplaceOrderSdkFactory = (options) => new TInvestNodeSDK(options);

const replaceOrderPriceTypes = {
  point: PriceType.PRICE_TYPE_POINT,
  currency: PriceType.PRICE_TYPE_CURRENCY
} as const;

type ReplaceOrderPriceTypeName = keyof typeof replaceOrderPriceTypes;

const replaceOrderPriceTypeNames = Object.keys(replaceOrderPriceTypes) as ReplaceOrderPriceTypeName[];

const replaceOrderRequestOptionsSchema = {
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
  }
} as const;

const replaceOrderFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: replaceOrderFormats,
    default: 'table'
  }
} as const;

const replaceOrderOptionsSchema = withSdkOptions(
  replaceOrderRequestOptionsSchema,
  sideEffectConfirmationOptionsSchema,
  replaceOrderFormatOptionsSchema
);

type ReplaceOrderOptions = InferOptions<typeof replaceOrderOptionsSchema>;
type ReplaceOrderRequestOptions = CommandRequestOptions<
  ReplaceOrderOptions,
  'account-id' |
  'order-id' |
  'idempotency-key' |
  'quantity' |
  'price' |
  'price-type'
>;

export function parseReplaceOrderFormat(rawOptions: CommandRawOptions): ReplaceOrderFormat {
  return parseCommandOptions(rawOptions, replaceOrderFormatOptionsSchema).format;
}

export function createReplaceOrderCommand(
  createSdk: ReplaceOrderSdkFactory = defaultReplaceOrderSdkFactory
) {
  return command.define({
    path: replaceOrderCommandPath,
    options: replaceOrderOptionsSchema,
    handle({ options }) {
      return runReplaceOrderCommand(options, createSdk);
    }
  });
}

export const replaceOrderCommand = createReplaceOrderCommand();

async function runReplaceOrderCommand(
  options: ReplaceOrderOptions,
  createSdk: ReplaceOrderSdkFactory
): Promise<string> {
  assertSideEffectConfirmed(options.confirm);

  const request = createReplaceOrderRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.orders.replaceOrder(request);

    return formatReplaceOrder(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatReplaceOrder };

export function createReplaceOrderRequest(
  options: ReplaceOrderRequestOptions
): ReplaceOrderRequest {
  return {
    accountId: options['account-id'],
    orderId: options['order-id'],
    idempotencyKey: options['idempotency-key'],
    quantity: options.quantity,
    price: parsePositiveQuotationOption(options.price, 'price'),
    priceType: replaceOrderPriceTypes[options['price-type']],
    confirmMarginTrade: false
  };
}
