import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetOrderStateRequest, OrderState } from '../../../generated/orders';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../command-options';
import { parseCommandOptions, withSdkOptions } from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { createOrderStateRequest } from '../order-state/cli';
import { formatOrderState, orderStateFormats, type OrderStateFormat } from '../order-state/reporter';

type SandboxOrderStateSdk = {
  sandbox: {
    getSandboxOrderState(request: GetOrderStateRequest): Promise<OrderState>;
  };
  close(): void;
};

type SandboxOrderStateSdkFactory = (options: TinkoffInvestOptions) => SandboxOrderStateSdk;

const sandboxOrderStateCommandPath = ['sandbox', 'get-sandbox-order-state'] as const;
const defaultSandboxOrderStateSdkFactory: SandboxOrderStateSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

export function parseSandboxOrderStateFormat(rawOptions: CommandRawOptions): OrderStateFormat {
  return parseCommandOptions(rawOptions, sandboxOrderStateFormatOptionsSchema).format;
}

export function createSandboxOrderStateCommand(
  createSdk: SandboxOrderStateSdkFactory = defaultSandboxOrderStateSdkFactory
) {
  return defineCommand({
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
