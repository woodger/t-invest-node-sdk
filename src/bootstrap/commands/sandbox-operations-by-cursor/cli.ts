/**
 * Модуль CLI-команды `sandbox operation page`.
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
  GetOperationsByCursorRequest,
  GetOperationsByCursorResponse
} from '../../../generated/t_tech/invest/grpc/operations';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createOperationsByCursorRequest,
  parseOperationsByCursorLimit,
  parseOperationsByCursorOperationTypes,
  parseOperationsByCursorState
} from '../operations-by-cursor/cli';
import {
  formatOperationsByCursor,
  operationsByCursorFormats,
  type OperationsByCursorFormat
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
  options: TinkoffInvestOptions
) => SandboxOperationsByCursorSdk;

const sandboxOperationsByCursorCommandPath = ['sandbox', 'operation', 'page'] as const;
const defaultSandboxOperationsByCursorSdkFactory: SandboxOperationsByCursorSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

export function parseSandboxOperationsByCursorState(rawOptions: CommandRawOptions) {
  return parseOperationsByCursorState(rawOptions);
}

export function parseSandboxOperationsByCursorLimit(rawOptions: CommandRawOptions): number {
  return parseOperationsByCursorLimit(rawOptions);
}

export function parseSandboxOperationsByCursorOperationTypes(rawOptions: CommandRawOptions) {
  return parseOperationsByCursorOperationTypes(rawOptions);
}

export function parseSandboxOperationsByCursorFormat(
  rawOptions: CommandRawOptions
): OperationsByCursorFormat {
  return parseCommandOptions(rawOptions, sandboxOperationsByCursorFormatOptionsSchema).format;
}

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
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.sandbox.getSandboxOperationsByCursor(request);

    return formatOperationsByCursor(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatOperationsByCursor };

export function createSandboxOperationsByCursorRequest(
  options: SandboxOperationsByCursorRequestOptions
): GetOperationsByCursorRequest {
  return createOperationsByCursorRequest(options);
}
