import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  OperationState,
  type OperationsRequest,
  type OperationsResponse
} from '../../../generated/operations';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-mechanics';
import {
  parseCommandOptions,
  parseDateTimeOption,
  withSdkOptions
} from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatOperations, operationsFormats, type OperationsFormat } from './reporter';

type OperationsSdk = {
  operations: {
    getOperations(request: OperationsRequest): Promise<OperationsResponse>;
  };
  close(): void;
};

type OperationsSdkFactory = (options: TinkoffInvestOptions) => OperationsSdk;

const operationsCommandName = 'operations get-operations';
const operationsCommandPath = ['operations', 'get-operations'] as const;
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
  figi: {
    type: 'string'
  }
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

function parseOperationsOptions(rawOptions: CommandRawOptions) {
  return parseCommandOptions(rawOptions, operationsCommandName, operationsOptionsSchema);
}

export function parseOperationsState(rawOptions: CommandRawOptions): OperationState {
  const { state } = parseCommandOptions(
    rawOptions,
    operationsCommandName,
    operationsStateOptionsSchema
  );

  return operationStates[state];
}

export function parseOperationsRequest(rawOptions: CommandRawOptions): OperationsRequest {
  return createOperationsRequest(parseOperationsOptions(rawOptions));
}

export function parseOperationsFormat(rawOptions: CommandRawOptions): OperationsFormat {
  return parseCommandOptions(
    rawOptions,
    operationsCommandName,
    operationsFormatOptionsSchema
  ).format;
}

export function createOperationsCommand(
  createSdk: OperationsSdkFactory = defaultOperationsSdkFactory
) {
  return defineCommand({
    path: operationsCommandPath,
    options: operationsOptionsSchema,
    handle({ options }) {
      return runOperationsCommand(options, createSdk);
    }
  });
}

export const operationsCommand = createOperationsCommand();

async function runOperationsCommand(
  options: ReturnType<typeof parseOperationsOptions>,
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

function createOperationsRequest(
  options: ReturnType<typeof parseOperationsOptions>
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
    figi: options.figi ?? ''
  };
}
