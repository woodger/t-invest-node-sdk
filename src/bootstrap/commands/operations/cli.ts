/**
 * Модуль CLI-команды `operation list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  OperationState,
  type OperationsRequest,
  type OperationsResponse
} from '../../../generated/t_tech/invest/grpc/operations';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import {
  parseCommandOptions,
  parseDateTimeOption,
  withSdkOptions
} from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentIdWithDeprecatedFigiOptionsSchema,
  resolveOptionalInstrumentIdOption
} from '../../args/instrument-id-options';
import { formatOperations, operationsFormats, type OperationsFormat } from './reporter';

type OperationsSdk = {
  operations: {
    getOperations(request: OperationsRequest): Promise<OperationsResponse>;
  };
  close(): void;
};

type OperationsSdkFactory = (options: TinkoffInvestOptions) => OperationsSdk;

const operationsCommandPath = ['operation', 'list'] as const;
const defaultOperationsSdkFactory: OperationsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const operationStates = {
  unspecified: OperationState.OPERATION_STATE_UNSPECIFIED,
  executed: OperationState.OPERATION_STATE_EXECUTED,
  canceled: OperationState.OPERATION_STATE_CANCELED,
  progress: OperationState.OPERATION_STATE_PROGRESS
} as const;

type OperationStateName = keyof typeof operationStates;

const operationStateNames = Object.keys(operationStates) as OperationStateName[];

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
type OperationsRequestOptions = CommandRequestOptions<
  OperationsOptions,
  'account-id' |
  'from' |
  'to' |
  'state' |
  'instrument-id' |
  'figi'
>;


export function parseOperationsState(rawOptions: CommandRawOptions): OperationState {
  const { state } = parseCommandOptions(rawOptions, operationsStateOptionsSchema);

  return operationStates[state];
}


export function parseOperationsFormat(rawOptions: CommandRawOptions): OperationsFormat {
  return parseCommandOptions(rawOptions, operationsFormatOptionsSchema).format;
}

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
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.operations.getOperations(request);

    return formatOperations(response.operations, format);
  }
  finally {
    sdk.close();
  }
}

export { formatOperations };

export function createOperationsRequest(
  options: OperationsRequestOptions
): OperationsRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    accountId: options['account-id'],
    from,
    to,
    state: operationStates[options.state],
    figi: resolveOptionalInstrumentIdOption(options) ?? ''
  };
}
