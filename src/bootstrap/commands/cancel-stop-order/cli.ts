/**
 * Модуль CLI-команды `stoporders cancel-stop-order`.
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
  CancelStopOrderRequest,
  CancelStopOrderResponse
} from '../../../generated/stoporders';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import {
  cancelStopOrderFormats,
  formatCancelStopOrder,
  type CancelStopOrderFormat
} from './reporter';

type CancelStopOrderSdk = {
  stoporders: {
    cancelStopOrder(request: CancelStopOrderRequest): Promise<CancelStopOrderResponse>;
  };
  close(): void;
};

type CancelStopOrderSdkFactory = (options: TinkoffInvestOptions) => CancelStopOrderSdk;

const cancelStopOrderCommandPath = ['stoporders', 'cancel-stop-order'] as const;
const defaultCancelStopOrderSdkFactory: CancelStopOrderSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const cancelStopOrderRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  'stop-order-id': {
    type: 'string',
    required: true
  }
} as const;

const cancelStopOrderFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: cancelStopOrderFormats,
    default: 'table'
  }
} as const;

const cancelStopOrderOptionsSchema = withSdkOptions(
  cancelStopOrderRequestOptionsSchema,
  sideEffectConfirmationOptionsSchema,
  cancelStopOrderFormatOptionsSchema
);

type CancelStopOrderOptions = InferOptions<typeof cancelStopOrderOptionsSchema>;
type CancelStopOrderRequestOptions = CommandRequestOptions<
  CancelStopOrderOptions,
  'account-id' | 'stop-order-id'
>;

export function parseCancelStopOrderFormat(rawOptions: CommandRawOptions): CancelStopOrderFormat {
  return parseCommandOptions(rawOptions, cancelStopOrderFormatOptionsSchema).format;
}

export function createCancelStopOrderCommand(
  createSdk: CancelStopOrderSdkFactory = defaultCancelStopOrderSdkFactory
) {
  return command.define({
    path: cancelStopOrderCommandPath,
    options: cancelStopOrderOptionsSchema,
    handle({ options }) {
      return runCancelStopOrderCommand(options, createSdk);
    }
  });
}

export const cancelStopOrderCommand = createCancelStopOrderCommand();

async function runCancelStopOrderCommand(
  options: CancelStopOrderOptions,
  createSdk: CancelStopOrderSdkFactory
): Promise<string> {
  assertSideEffectConfirmed(options.confirm);

  const request = createCancelStopOrderRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.stoporders.cancelStopOrder(request);

    return formatCancelStopOrder(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatCancelStopOrder };

export function createCancelStopOrderRequest(
  options: CancelStopOrderRequestOptions
): CancelStopOrderRequest {
  return {
    accountId: options['account-id'],
    stopOrderId: options['stop-order-id']
  };
}
