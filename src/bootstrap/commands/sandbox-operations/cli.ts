/**
 * Модуль CLI-команды `sandbox operation list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - переиспользование общего production/Sandbox request mapper-а;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { OperationsRequest, OperationsResponse } from '../../../generated/operations';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { instrumentIdWithDeprecatedFigiOptionsSchema } from '../../args/instrument-id-options';
import { createOperationsRequest } from '../operations/request.mapper';
import { formatOperations, operationsFormats } from '../operations/reporter';

type SandboxOperationsSdk = {
  sandbox: {
    getSandboxOperations(request: OperationsRequest): Promise<OperationsResponse>;
  };
  close(): void;
};

type SandboxOperationsSdkFactory = (options: TInvestOptions) => SandboxOperationsSdk;

const sandboxOperationsCommandPath = ['sandbox', 'operation', 'list'] as const;
const defaultSandboxOperationsSdkFactory: SandboxOperationsSdkFactory = (options) => new TInvestNodeSDK(options);

const sandboxOperationsRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  from: {
    type: 'string',
    required: true
  },
  to: {
    type: 'string',
    required: true
  },
  ...instrumentIdWithDeprecatedFigiOptionsSchema,
  state: {
    type: 'string',
    choices: ['unspecified', 'executed', 'canceled', 'progress'],
    default: 'unspecified'
  }
} as const;

const sandboxOperationsFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: operationsFormats,
    default: 'table'
  }
} as const;

const sandboxOperationsOptionsSchema = withSdkOptions(
  sandboxOperationsRequestOptionsSchema,
  sandboxOperationsFormatOptionsSchema
);

type SandboxOperationsOptions = InferOptions<typeof sandboxOperationsOptionsSchema>;
type SandboxOperationsRequestOptions = CommandRequestOptions<
  SandboxOperationsOptions,
  'account-id' | 'from' | 'to' | 'instrument-id' | 'figi' | 'state'
>;

export function createSandboxOperationsCommand(
  createSdk: SandboxOperationsSdkFactory = defaultSandboxOperationsSdkFactory
) {
  return command.define({
    path: sandboxOperationsCommandPath,
    options: sandboxOperationsOptionsSchema,
    handle({ options }) {
      return runSandboxOperationsCommand(options, createSdk);
    }
  });
}

export const sandboxOperationsCommand = createSandboxOperationsCommand();

async function runSandboxOperationsCommand(
  options: SandboxOperationsOptions,
  createSdk: SandboxOperationsSdkFactory
): Promise<string> {
  const request = createSandboxOperationsRequest(options);
  const { format } = options;
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.sandbox.getSandboxOperations(request);

    return formatOperations(response.operations, format);
  });
}

export function createSandboxOperationsRequest(
  options: SandboxOperationsRequestOptions
): OperationsRequest {
  return createOperationsRequest(options);
}
