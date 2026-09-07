/**
 * Модуль CLI-команды `sandbox order list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { GetOrdersRequest, GetOrdersResponse } from '../../../generated/orders';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createOrdersRequest } from '../orders/cli';
import { formatOrders, ordersFormats } from '../orders/reporter';

type SandboxOrdersSdk = {
  sandbox: {
    getSandboxOrders(request: GetOrdersRequest): Promise<GetOrdersResponse>;
  };
  close(): void;
};

type SandboxOrdersSdkFactory = (options: TInvestOptions) => SandboxOrdersSdk;

const sandboxOrdersCommandPath = ['sandbox', 'order', 'list'] as const;
const defaultSandboxOrdersSdkFactory: SandboxOrdersSdkFactory = (options) => new TInvestNodeSDK(options);

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
