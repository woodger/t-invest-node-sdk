/**
 * Модуль CLI-команды `operation list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - делегирование request mapping в command-owned mapper;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  type OperationsRequest,
  type OperationsResponse
} from '../../../generated/operations';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  instrumentIdWithDeprecatedFigiOptionsSchema
} from '../../args/instrument-id-options';
import { formatOperations, operationsFormats } from './reporter';
import { createOperationsRequest } from './request.mapper';

type OperationsSdk = {
  operations: {
    getOperations(request: OperationsRequest): Promise<OperationsResponse>;
  };
  close(): void;
};

type OperationsSdkFactory = (options: TInvestOptions) => OperationsSdk;

const operationsCommandPath = ['operation', 'list'] as const;
const defaultOperationsSdkFactory: OperationsSdkFactory = (options) => new TInvestNodeSDK(options);

const operationStateNames = ['unspecified', 'executed', 'canceled', 'progress'] as const;

const operationsStateOptionsSchema = {
  state: {
    type: 'string',
    choices: operationStateNames,
    default: 'unspecified'
  }
} as const;

const operationsRequestOptionsSchema = {
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
  ...instrumentIdWithDeprecatedFigiOptionsSchema
} as const;

const operationsFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: operationsFormats,
    default: 'table'
  }
} as const;

const operationsOptionsSchema = withSdkOptions(
  operationsRequestOptionsSchema,
  operationsStateOptionsSchema,
  operationsFormatOptionsSchema
);

type OperationsOptions = InferOptions<typeof operationsOptionsSchema>;
export function createOperationsCommand(
  createSdk: OperationsSdkFactory = defaultOperationsSdkFactory
) {
  return command.define({
    path: operationsCommandPath,
    options: operationsOptionsSchema,
    handle({ options }) {
      return runOperationsCommand(options, createSdk);
    }
  });
}

export const operationsCommand = createOperationsCommand();

async function runOperationsCommand(
  options: OperationsOptions,
  createSdk: OperationsSdkFactory
): Promise<string> {
  const request = createOperationsRequest(options);
  const { format } = options;
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.operations.getOperations(request);

    return formatOperations(response.operations, format);
  });
}
