/**
 * Модуль CLI-команды `sandbox get-sandbox-operations`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { OperationsRequest, OperationsResponse } from '../../../generated/operations';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../command-options';
import { parseCommandOptions, withSdkOptions } from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { instrumentIdWithDeprecatedFigiOptionsSchema } from '../instrument-id-options';
import {
  createOperationsRequest,
  parseOperationsState
} from '../operations/cli';
import { formatOperations, operationsFormats, type OperationsFormat } from '../operations/reporter';

type SandboxOperationsSdk = {
  sandbox: {
    getSandboxOperations(request: OperationsRequest): Promise<OperationsResponse>;
  };
  close(): void;
};

type SandboxOperationsSdkFactory = (options: TinkoffInvestOptions) => SandboxOperationsSdk;

const sandboxOperationsCommandPath = ['sandbox', 'get-sandbox-operations'] as const;
const defaultSandboxOperationsSdkFactory: SandboxOperationsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

export function parseSandboxOperationsState(rawOptions: CommandRawOptions) {
  return parseOperationsState(rawOptions);
}

export function parseSandboxOperationsFormat(rawOptions: CommandRawOptions): OperationsFormat {
  return parseCommandOptions(rawOptions, sandboxOperationsFormatOptionsSchema).format;
}

export function createSandboxOperationsCommand(
  createSdk: SandboxOperationsSdkFactory = defaultSandboxOperationsSdkFactory
) {
  return defineCommand({
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
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.sandbox.getSandboxOperations(request);

    return formatOperations(response.operations, format);
  }
  finally {
    sdk.close();
  }
}

export { formatOperations };

export function createSandboxOperationsRequest(
  options: SandboxOperationsRequestOptions
): OperationsRequest {
  return createOperationsRequest(options);
}
