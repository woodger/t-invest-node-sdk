/**
 * Модуль CLI-команды `sandbox operation page`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - переиспользование общего production/Sandbox request mapper-а;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  GetOperationsByCursorRequest,
  GetOperationsByCursorResponse
} from '../../../generated/operations';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createOperationsByCursorRequest } from '../operations-by-cursor/request.mapper';
import {
  formatOperationsByCursor,
  operationsByCursorFormats
} from '../operations-by-cursor/reporter';

type SandboxOperationsByCursorSdk = {
  sandbox: {
    getSandboxOperationsByCursor(
      request: GetOperationsByCursorRequest
    ): Promise<GetOperationsByCursorResponse>;
  };
  close(): void;
};

type SandboxOperationsByCursorSdkFactory = (
  options: TInvestOptions
) => SandboxOperationsByCursorSdk;

const sandboxOperationsByCursorCommandPath = ['sandbox', 'operation', 'page'] as const;
const defaultSandboxOperationsByCursorSdkFactory: SandboxOperationsByCursorSdkFactory = (options) => new TInvestNodeSDK(options);

const sandboxOperationsByCursorRequestOptionsSchema = {
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
  limit: {
    type: 'string'
  },
  'operation-type': {
    type: 'string'
  },
  state: {
    type: 'string',
    choices: ['unspecified', 'executed', 'canceled', 'progress'],
    default: 'unspecified'
  },
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

const sandboxOperationsByCursorFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: operationsByCursorFormats,
    default: 'table'
  }
} as const;

const sandboxOperationsByCursorOptionsSchema = withSdkOptions(
  sandboxOperationsByCursorRequestOptionsSchema,
  sandboxOperationsByCursorFormatOptionsSchema
);

type SandboxOperationsByCursorOptions = InferOptions<
  typeof sandboxOperationsByCursorOptionsSchema
>;
type SandboxOperationsByCursorRequestOptions = CommandRequestOptions<
  SandboxOperationsByCursorOptions,
  'account-id' |
  'instrument-id' |
  'operation-type' |
  'without-commissions' |
  'without-trades' |
  'without-overnights' |
  'from' |
  'to' |
  'cursor' |
  'limit' |
  'state'
>;

export function createSandboxOperationsByCursorCommand(
  createSdk: SandboxOperationsByCursorSdkFactory = defaultSandboxOperationsByCursorSdkFactory
) {
  return command.define({
    path: sandboxOperationsByCursorCommandPath,
    options: sandboxOperationsByCursorOptionsSchema,
    handle({ options }) {
      return runSandboxOperationsByCursorCommand(options, createSdk);
    }
  });
}

export const sandboxOperationsByCursorCommand = createSandboxOperationsByCursorCommand();

async function runSandboxOperationsByCursorCommand(
  options: SandboxOperationsByCursorOptions,
  createSdk: SandboxOperationsByCursorSdkFactory
): Promise<string> {
  const request = createSandboxOperationsByCursorRequest(options);
  const { format } = options;
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.sandbox.getSandboxOperationsByCursor(request);

    return formatOperationsByCursor(response, format);
  });
}

export function createSandboxOperationsByCursorRequest(
  options: SandboxOperationsByCursorRequestOptions
): GetOperationsByCursorRequest {
  return createOperationsByCursorRequest(options);
}
