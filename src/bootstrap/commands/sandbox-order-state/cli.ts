/**
 * Модуль CLI-команды `sandbox order show`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { GetOrderStateRequest, OrderState } from '../../../generated/orders';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createOrderStateRequest } from '../order-state/cli';
import { formatOrderState, orderStateFormats } from '../order-state/reporter';

type SandboxOrderStateSdk = {
  sandbox: {
    getSandboxOrderState(request: GetOrderStateRequest): Promise<OrderState>;
  };
  close(): void;
};

type SandboxOrderStateSdkFactory = (options: TInvestOptions) => SandboxOrderStateSdk;

const sandboxOrderStateCommandPath = ['sandbox', 'order', 'show'] as const;
const defaultSandboxOrderStateSdkFactory: SandboxOrderStateSdkFactory = (options) => new TInvestNodeSDK(options);

const sandboxOrderStateRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  'order-id': {
    type: 'string',
    required: true
  }
} as const;

const sandboxOrderStateFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: orderStateFormats,
    default: 'table'
  }
} as const;

const sandboxOrderStateOptionsSchema = withSdkOptions(
  sandboxOrderStateRequestOptionsSchema,
  sandboxOrderStateFormatOptionsSchema
);

type SandboxOrderStateOptions = InferOptions<typeof sandboxOrderStateOptionsSchema>;
type SandboxOrderStateRequestOptions = CommandRequestOptions<
  SandboxOrderStateOptions,
  'account-id' | 'order-id'
>;

export function createSandboxOrderStateCommand(
  createSdk: SandboxOrderStateSdkFactory = defaultSandboxOrderStateSdkFactory
) {
  return command.define({
    path: sandboxOrderStateCommandPath,
    options: sandboxOrderStateOptionsSchema,
    handle({ options }) {
      return runSandboxOrderStateCommand(options, createSdk);
    }
  });
}

export const sandboxOrderStateCommand = createSandboxOrderStateCommand();

async function runSandboxOrderStateCommand(
  options: SandboxOrderStateOptions,
  createSdk: SandboxOrderStateSdkFactory
): Promise<string> {
  const request = createSandboxOrderStateRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.sandbox.getSandboxOrderState(request);

    return formatOrderState(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatOrderState };

export function createSandboxOrderStateRequest(
  options: SandboxOrderStateRequestOptions
): GetOrderStateRequest {
  return createOrderStateRequest(options);
}
