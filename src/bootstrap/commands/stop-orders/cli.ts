/**
 * Модуль CLI-команды `stop-order list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  GetStopOrdersRequest,
  StopOrderStatusOption,
  type GetStopOrdersResponse
} from '../../../generated/stoporders';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatStopOrders, stopOrdersFormats } from './reporter';

type StopOrdersSdk = {
  stopOrders: {
    getStopOrders(request: GetStopOrdersRequest): Promise<GetStopOrdersResponse>;
  };
  close(): void;
};

type StopOrdersSdkFactory = (options: TInvestOptions) => StopOrdersSdk;

const stopOrdersCommandPath = ['stop-order', 'list'] as const;
const defaultStopOrdersSdkFactory: StopOrdersSdkFactory = (options) => new TInvestNodeSDK(options);

const stopOrdersRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  }
} as const;

const stopOrdersFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: stopOrdersFormats,
    default: 'table'
  }
} as const;

const stopOrdersOptionsSchema = withSdkOptions(
  stopOrdersRequestOptionsSchema,
  stopOrdersFormatOptionsSchema
);

type StopOrdersOptions = InferOptions<typeof stopOrdersOptionsSchema>;
type StopOrdersRequestOptions = CommandRequestOptions<StopOrdersOptions, 'account-id'>;

export function createStopOrdersCommand(
  createSdk: StopOrdersSdkFactory = defaultStopOrdersSdkFactory
) {
  return command.define({
    path: stopOrdersCommandPath,
    options: stopOrdersOptionsSchema,
    handle({ options }) {
      return runStopOrdersCommand(options, createSdk);
    }
  });
}

export const stopOrdersCommand = createStopOrdersCommand();

async function runStopOrdersCommand(
  options: StopOrdersOptions,
  createSdk: StopOrdersSdkFactory
): Promise<string> {
  const request = createStopOrdersRequest(options);
  const { format } = options;
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.stopOrders.getStopOrders(request);

    return formatStopOrders(response, format);
  });
}

export function createStopOrdersRequest(
  options: StopOrdersRequestOptions
): GetStopOrdersRequest {
  return {
    accountId: options['account-id'],
    status: StopOrderStatusOption.STOP_ORDER_STATUS_UNSPECIFIED,
    from: undefined,
    to: undefined
  };
}
