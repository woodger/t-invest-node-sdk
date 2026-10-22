/**
 * Модуль CLI-команды `stop-order cancel`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  CancelStopOrderRequest,
  CancelStopOrderResponse
} from '../../../generated/stoporders';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import { cancelStopOrderFormats, formatCancelStopOrder } from './reporter';

type CancelStopOrderSdk = {
  stopOrders: {
    cancelStopOrder(
      request: CancelStopOrderRequest
    ): Promise<CancelStopOrderResponse>;
  };
  close(): void;
};

type CancelStopOrderSdkFactory = (
  options: TInvestOptions
) => CancelStopOrderSdk;

type CancelStopOrderOptions = InferOptions<typeof cancelStopOrderOptionsSchema>;
type CancelStopOrderRequestOptions = CommandRequestOptions<
  CancelStopOrderOptions,
  'account-id' | 'stop-order-id'
>;

const cancelStopOrderOptionsSchema = withSdkOptions({
  'account-id': {
    type: 'string',
    required: true
  },
  'stop-order-id': {
    type: 'string',
    required: true
  },
  ...sideEffectConfirmationOptionsSchema,
  format: {
    type: 'string',
    choices: cancelStopOrderFormats,
    default: 'table'
  }
});

export function createCancelStopOrderCommand(
  createSdk: CancelStopOrderSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['stop-order', 'cancel'] as const,
    options: cancelStopOrderOptionsSchema,
    async handle({ options }) {
      assertSideEffectConfirmed(options.confirm);

      const request = createCancelStopOrderRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.stopOrders.cancelStopOrder(request);

        return formatCancelStopOrder(response, format);
      });
    }
  });
}

export const cancelStopOrderCommand = createCancelStopOrderCommand();

export function createCancelStopOrderRequest(
  options: CancelStopOrderRequestOptions
): CancelStopOrderRequest {
  return {
    accountId: options['account-id'],
    stopOrderId: options['stop-order-id']
  };
}
