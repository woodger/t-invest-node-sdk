import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  OperationState,
  type OperationsRequest,
  type OperationsResponse
} from '../../../generated/operations';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatOperations, operationsFormats, type OperationsFormat } from './reporter';

type OperationsSdk = {
  operations: {
    getOperations(request: OperationsRequest): Promise<OperationsResponse>;
  };
  close(): void;
};

type OperationsSdkFactory = (options: TinkoffInvestOptions) => OperationsSdk;

const operationsArgNames = new Set([
  ...sdkOptionArgNames,
  'account-id',
  'from',
  'to',
  'state',
  'figi',
  'format'
]);

const operationStates = {
  unspecified: OperationState.OPERATION_STATE_UNSPECIFIED,
  executed: OperationState.OPERATION_STATE_EXECUTED,
  canceled: OperationState.OPERATION_STATE_CANCELED,
  progress: OperationState.OPERATION_STATE_PROGRESS
} as const;

type OperationStateName = keyof typeof operationStates;

export function parseOperationsState(argv: CliArgs): OperationState {
  const state = ArgGuards.optionalEnumArgValue(
    argv,
    'state',
    Object.keys(operationStates) as OperationStateName[]
  ) ?? 'unspecified';

  return operationStates[state];
}

export function parseOperationsRequest(argv: CliArgs): OperationsRequest {
  const from = ArgGuards.parseDateArg(argv, 'from');
  const to = ArgGuards.parseDateArg(argv, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    accountId: ArgGuards.requireStringArg(argv, 'account-id'),
    from,
    to,
    state: parseOperationsState(argv),
    figi: ArgGuards.optionalStringArgValue(argv, 'figi') ?? ''
  };
}

export function parseOperationsFormat(argv: CliArgs): OperationsFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', operationsFormats) ?? 'table';
}

export function createOperationsCommand(
  createSdk: OperationsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function operations(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, operationsArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'operations get-operations');

    const request = parseOperationsRequest(argv);
    const format = parseOperationsFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.operations.getOperations(request);

      return formatOperations(response.operations, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const operations = createOperationsCommand();

export { formatOperations };
