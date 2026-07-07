/**
 * Модуль CLI-команды `sandbox get-sandbox-orders`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetOrdersRequest, GetOrdersResponse } from '../../../generated/orders';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { createOrdersRequest } from '../orders/cli';
import { formatOrders, ordersFormats, type OrdersFormat } from '../orders/reporter';

type SandboxOrdersSdk = {
  sandbox: {
    getSandboxOrders(request: GetOrdersRequest): Promise<GetOrdersResponse>;
  };
  close(): void;
};

type SandboxOrdersSdkFactory = (options: TinkoffInvestOptions) => SandboxOrdersSdk;

const sandboxOrdersCommandPath = ['sandbox', 'get-sandbox-orders'] as const;
const defaultSandboxOrdersSdkFactory: SandboxOrdersSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const sandboxOrdersRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  }
} as const;

const sandboxOrdersFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: ordersFormats,
    default: 'table'
  }
} as const;

const sandboxOrdersOptionsSchema = withSdkOptions(
  sandboxOrdersRequestOptionsSchema,
  sandboxOrdersFormatOptionsSchema
);

type SandboxOrdersOptions = InferOptions<typeof sandboxOrdersOptionsSchema>;
type SandboxOrdersRequestOptions = CommandRequestOptions<SandboxOrdersOptions, 'account-id'>;

export function parseSandboxOrdersFormat(rawOptions: CommandRawOptions): OrdersFormat {
  return parseCommandOptions(rawOptions, sandboxOrdersFormatOptionsSchema).format;
}

export function createSandboxOrdersCommand(
  createSdk: SandboxOrdersSdkFactory = defaultSandboxOrdersSdkFactory
) {
  return command.define({
    path: sandboxOrdersCommandPath,
    options: sandboxOrdersOptionsSchema,
    handle({ options }) {
      return runSandboxOrdersCommand(options, createSdk);
    }
  });
}

export const sandboxOrdersCommand = createSandboxOrdersCommand();

async function runSandboxOrdersCommand(
  options: SandboxOrdersOptions,
  createSdk: SandboxOrdersSdkFactory
): Promise<string> {
  const request = createSandboxOrdersRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.sandbox.getSandboxOrders(request);

    return formatOrders(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatOrders };

export function createSandboxOrdersRequest(
  options: SandboxOrdersRequestOptions
): GetOrdersRequest {
  return createOrdersRequest(options);
}
