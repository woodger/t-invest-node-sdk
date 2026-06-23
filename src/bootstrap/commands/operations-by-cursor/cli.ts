import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  OperationState,
  OperationType,
  operationTypeFromJSON,
  type GetOperationsByCursorRequest,
  type GetOperationsByCursorResponse
} from '../../../generated/operations';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  formatOperationsByCursor,
  operationsByCursorFormats,
  type OperationsByCursorFormat
} from './reporter';

type OperationsByCursorSdk = {
  operations: {
    getOperationsByCursor(
      request: GetOperationsByCursorRequest
    ): Promise<GetOperationsByCursorResponse>;
  };
  close(): void;
};

type OperationsByCursorSdkFactory = (options: TinkoffInvestOptions) => OperationsByCursorSdk;

const operationsByCursorArgNames = new Set([
  ...sdkOptionArgNames,
  'account-id',
  'instrument-id',
  'from',
  'to',
  'cursor',
  'limit',
  'operation-type',
  'state',
  'without-commissions',
  'without-trades',
  'without-overnights',
  'format'
]);

const operationStates = {
  unspecified: OperationState.OPERATION_STATE_UNSPECIFIED,
  executed: OperationState.OPERATION_STATE_EXECUTED,
  canceled: OperationState.OPERATION_STATE_CANCELED,
  progress: OperationState.OPERATION_STATE_PROGRESS
} as const;

type OperationStateName = keyof typeof operationStates;

function parseOptionalDateArg(argv: CliArgs, name: string): Date | undefined {
  const value = ArgGuards.optionalStringArgValue(argv, name);

  if (value === undefined) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Expected '--${name}' as date-time`);
  }

  return date;
}

export function parseOperationsByCursorState(argv: CliArgs): OperationState {
  const state = ArgGuards.optionalEnumArgValue(
    argv,
    'state',
    Object.keys(operationStates) as OperationStateName[]
  ) ?? 'unspecified';

  return operationStates[state];
}

export function parseOperationsByCursorLimit(argv: CliArgs): number {
  const rawValue = ArgGuards.optionalStringArgValue(argv, 'limit');

  if (rawValue === undefined) {
    return 0;
  }

  if (!/^\d+$/.test(rawValue)) {
    throw new Error("Expected '--limit' as integer from 1 to 1000");
  }

  const limit = Number(rawValue);

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) {
    throw new Error("Expected '--limit' as integer from 1 to 1000");
  }

  return limit;
}

export function parseOperationsByCursorOperationTypes(argv: CliArgs): OperationType[] {
  const rawValue = ArgGuards.optionalStringArgValue(argv, 'operation-type');

  if (rawValue === undefined) {
    return [];
  }

  const operationTypes = rawValue.split(',').map((value) => value.trim());

  if (operationTypes.some((value) => value === '')) {
    throw new Error("Expected '--operation-type' as comma-separated list");
  }

  return operationTypes.map((value) => {
    const operationType = operationTypeFromJSON(value);

    if (operationType === OperationType.UNRECOGNIZED) {
      throw new Error("Expected '--operation-type' as generated OperationType name");
    }

    return operationType;
  });
}

export function parseOperationsByCursorRequest(argv: CliArgs): GetOperationsByCursorRequest {
  const from = parseOptionalDateArg(argv, 'from');
  const to = parseOptionalDateArg(argv, 'to');

  if (from !== undefined && to !== undefined && from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    accountId: ArgGuards.requireStringArg(argv, 'account-id'),
    instrumentId: ArgGuards.optionalStringArgValue(argv, 'instrument-id') ?? '',
    from,
    to,
    cursor: ArgGuards.optionalStringArgValue(argv, 'cursor') ?? '',
    limit: parseOperationsByCursorLimit(argv),
    operationTypes: parseOperationsByCursorOperationTypes(argv),
    state: parseOperationsByCursorState(argv),
    withoutCommissions: ArgGuards.optionalBooleanFlagArg(argv, 'without-commissions') ?? false,
    withoutTrades: ArgGuards.optionalBooleanFlagArg(argv, 'without-trades') ?? false,
    withoutOvernights: ArgGuards.optionalBooleanFlagArg(argv, 'without-overnights') ?? false
  };
}

export function parseOperationsByCursorFormat(argv: CliArgs): OperationsByCursorFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', operationsByCursorFormats) ?? 'table';
}

export function createOperationsByCursorCommand(
  createSdk: OperationsByCursorSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function operationsByCursor(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, operationsByCursorArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'operations get-operations-by-cursor');

    const request = parseOperationsByCursorRequest(argv);
    const format = parseOperationsByCursorFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.operations.getOperationsByCursor(request);

      return formatOperationsByCursor(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const operationsByCursor = createOperationsByCursorCommand();

export { formatOperationsByCursor };
