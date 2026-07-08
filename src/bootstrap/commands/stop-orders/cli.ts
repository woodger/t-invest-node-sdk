/**
 * Модуль CLI-команды `stop-order list`.
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
  GetStopOrdersRequest,
  GetStopOrdersResponse
} from '../../../generated/stoporders';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatStopOrders, stopOrdersFormats, type StopOrdersFormat } from './reporter';

type StopOrdersSdk = {
  stoporders: {
    getStopOrders(request: GetStopOrdersRequest): Promise<GetStopOrdersResponse>;
  };
  close(): void;
};

type StopOrdersSdkFactory = (options: TinkoffInvestOptions) => StopOrdersSdk;

const stopOrdersCommandPath = ['stop-order', 'list'] as const;
const defaultStopOrdersSdkFactory: StopOrdersSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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



export function parseStopOrdersFormat(rawOptions: CommandRawOptions): StopOrdersFormat {
  return parseCommandOptions(rawOptions, stopOrdersFormatOptionsSchema).format;
}

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
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.stoporders.getStopOrders(request);

    return formatStopOrders(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatStopOrders };

export function createStopOrdersRequest(
  options: StopOrdersRequestOptions
): GetStopOrdersRequest {
  return {
    accountId: options['account-id']
  };
}
