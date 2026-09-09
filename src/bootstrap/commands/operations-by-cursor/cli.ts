/**
 * Модуль CLI-команды `operation page`.
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
  type GetOperationsByCursorRequest,
  type GetOperationsByCursorResponse
} from '../../../generated/operations';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatOperationsByCursor, operationsByCursorFormats } from './reporter';
import { createOperationsByCursorRequest } from './request.mapper';

type OperationsByCursorSdk = {
  operations: {
    getOperationsByCursor(
      request: GetOperationsByCursorRequest
    ): Promise<GetOperationsByCursorResponse>;
  };
  close(): void;
};

type OperationsByCursorSdkFactory = (options: TInvestOptions) => OperationsByCursorSdk;

const operationsByCursorCommandPath = ['operation', 'page'] as const;
const defaultOperationsByCursorSdkFactory: OperationsByCursorSdkFactory = (options) => new TInvestNodeSDK(options);

const operationStateNames = ['unspecified', 'executed', 'canceled', 'progress'] as const;

const operationsByCursorStateOptionsSchema = {
  state: {
    type: 'string',
    choices: operationStateNames,
    default: 'unspecified'
  }
} as const;

const operationsByCursorLimitOptionsSchema = {
  limit: {
    type: 'string'
  }
} as const;

const operationsByCursorOperationTypesOptionsSchema = {
  'operation-type': {
    type: 'string'
  }
} as const;

const operationsByCursorRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  'instrument-id': {
    type: 'string'
  },
  from: {
    type: 'string'
  },
  to: {
    type: 'string'
  },
  cursor: {
    type: 'string'
  },
  ...operationsByCursorLimitOptionsSchema,
  ...operationsByCursorOperationTypesOptionsSchema,
  ...operationsByCursorStateOptionsSchema,
  'without-commissions': {
    type: 'boolean',
    default: false
  },
  'without-trades': {
    type: 'boolean',
    default: false
  },
  'without-overnights': {
    type: 'boolean',
    default: false
  }
} as const;

const operationsByCursorFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: operationsByCursorFormats,
    default: 'table'
  }
} as const;

const operationsByCursorOptionsSchema = withSdkOptions(
  operationsByCursorRequestOptionsSchema,
  operationsByCursorFormatOptionsSchema
);

type OperationsByCursorOptions = InferOptions<typeof operationsByCursorOptionsSchema>;
export function createOperationsByCursorCommand(
  createSdk: OperationsByCursorSdkFactory = defaultOperationsByCursorSdkFactory
) {
  return command.define({
    path: operationsByCursorCommandPath,
    options: operationsByCursorOptionsSchema,
    handle({ options }) {
      return runOperationsByCursorCommand(options, createSdk);
    }
  });
}

export const operationsByCursorCommand = createOperationsByCursorCommand();

async function runOperationsByCursorCommand(
  options: OperationsByCursorOptions,
  createSdk: OperationsByCursorSdkFactory
): Promise<string> {
  const request = createOperationsByCursorRequest(options);
  const { format } = options;
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.operations.getOperationsByCursor(request);

    return formatOperationsByCursor(response, format);
  });
}
