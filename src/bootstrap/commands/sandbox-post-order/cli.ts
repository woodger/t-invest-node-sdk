/**
 * Модуль CLI-команды `sandbox post-sandbox-order`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { PostOrderRequest, PostOrderResponse } from '../../../generated/orders';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../command-options';
import { parseCommandOptions, withSdkOptions } from '../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { createPostOrderRequest } from '../post-order/cli';
import {
  formatPostOrder,
  postOrderFormats,
  type PostOrderFormat
} from '../post-order/reporter';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../side-effect-args';

type SandboxPostOrderSdk = {
  sandbox: {
    postSandboxOrder(request: PostOrderRequest): Promise<PostOrderResponse>;
  };
  close(): void;
};

type SandboxPostOrderSdkFactory = (options: TinkoffInvestOptions) => SandboxPostOrderSdk;

const sandboxPostOrderCommandPath = ['sandbox', 'post-sandbox-order'] as const;
const defaultSandboxPostOrderSdkFactory: SandboxPostOrderSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const sandboxPostOrderRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  'instrument-id': {
    type: 'string',
    required: true
  },
  quantity: {
    type: 'number',
    integer: true,
    min: 1,
    required: true
  },
  price: {
    type: 'string'
  },
  direction: {
    type: 'string',
    choices: ['buy', 'sell'],
    required: true
  },
  'order-type': {
    type: 'string',
    choices: ['limit', 'market', 'bestprice'],
    required: true
  },
  'order-id': {
    type: 'string',
    required: true
  }
} as const;

const sandboxPostOrderFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: postOrderFormats,
    default: 'table'
  }
} as const;

const sandboxPostOrderOptionsSchema = withSdkOptions(
  sandboxPostOrderRequestOptionsSchema,
  sideEffectConfirmationOptionsSchema,
  sandboxPostOrderFormatOptionsSchema
);

type SandboxPostOrderOptions = InferOptions<typeof sandboxPostOrderOptionsSchema>;
type SandboxPostOrderRequestOptions = CommandRequestOptions<
  SandboxPostOrderOptions,
  'account-id' |
  'instrument-id' |
  'quantity' |
  'price' |
  'direction' |
  'order-type' |
  'order-id'
>;

export function parseSandboxPostOrderFormat(rawOptions: CommandRawOptions): PostOrderFormat {
  return parseCommandOptions(rawOptions, sandboxPostOrderFormatOptionsSchema).format;
}

export function createSandboxPostOrderCommand(
  createSdk: SandboxPostOrderSdkFactory = defaultSandboxPostOrderSdkFactory
) {
  return command.define({
    path: sandboxPostOrderCommandPath,
    options: sandboxPostOrderOptionsSchema,
    handle({ options }) {
      return runSandboxPostOrderCommand(options, createSdk);
    }
  });
}

export const sandboxPostOrderCommand = createSandboxPostOrderCommand();

async function runSandboxPostOrderCommand(
  options: SandboxPostOrderOptions,
  createSdk: SandboxPostOrderSdkFactory
): Promise<string> {
  assertSideEffectConfirmed(options.confirm);

  const request = createSandboxPostOrderRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.sandbox.postSandboxOrder(request);

    return formatPostOrder(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatPostOrder };

export function createSandboxPostOrderRequest(
  options: SandboxPostOrderRequestOptions
): PostOrderRequest {
  return createPostOrderRequest(options);
}
