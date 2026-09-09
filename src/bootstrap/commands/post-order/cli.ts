/**
 * Модуль CLI-команды `order place`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - делегирование request mapping в command-owned mapper;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  type PostOrderRequest,
  type PostOrderResponse
} from '../../../generated/orders';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { positiveSafeIntegerOption, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import { formatPostOrder, postOrderFormats } from './reporter';
import { createPostOrderRequest } from './request.mapper';

type PostOrderSdk = {
  orders: {
    postOrder(request: PostOrderRequest): Promise<PostOrderResponse>;
  };
  close(): void;
};

type PostOrderSdkFactory = (options: TInvestOptions) => PostOrderSdk;

const postOrderCommandPath = ['order', 'place'] as const;
const defaultPostOrderSdkFactory: PostOrderSdkFactory = (options) => new TInvestNodeSDK(options);

const postOrderDirectionNames = ['buy', 'sell'] as const;
const postOrderTypeNames = ['limit', 'market', 'bestprice'] as const;

const postOrderRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  'instrument-id': {
    type: 'string',
    required: true
  },
  quantity: {
    ...positiveSafeIntegerOption,
    required: true
  },
  price: {
    type: 'string'
  },
  direction: {
    type: 'string',
    choices: postOrderDirectionNames,
    required: true
  },
  'order-type': {
    type: 'string',
    choices: postOrderTypeNames,
    required: true
  },
  'order-id': {
    type: 'string',
    required: true
  }
} as const;

const postOrderFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: postOrderFormats,
    default: 'table'
  }
} as const;

const postOrderOptionsSchema = withSdkOptions(
  postOrderRequestOptionsSchema,
  sideEffectConfirmationOptionsSchema,
  postOrderFormatOptionsSchema
);

type PostOrderOptions = InferOptions<typeof postOrderOptionsSchema>;
export function createPostOrderCommand(
  createSdk: PostOrderSdkFactory = defaultPostOrderSdkFactory
) {
  return command.define({
    path: postOrderCommandPath,
    options: postOrderOptionsSchema,
    handle({ options }) {
      return runPostOrderCommand(options, createSdk);
    }
  });
}

export const postOrderCommand = createPostOrderCommand();

async function runPostOrderCommand(
  options: PostOrderOptions,
  createSdk: PostOrderSdkFactory
): Promise<string> {
  assertSideEffectConfirmed(options.confirm);

  const request = createPostOrderRequest(options);
  const { format } = options;
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.orders.postOrder(request);

    return formatPostOrder(response, format);
  });
}
