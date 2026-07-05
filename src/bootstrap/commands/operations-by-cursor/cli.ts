/**
 * Модуль CLI-команды `operations get-operations-by-cursor`.
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
  OperationType,
  operationTypeFromJSON,
  type GetOperationsByCursorRequest,
  type GetOperationsByCursorResponse
} from '../../../generated/operations';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../command-options';
import {
  parseCommaSeparatedStringListOption,
  parseCommandOptions,
  parseDateTimeOption,
  withSdkOptions
} from '../command-options';
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

const operationsByCursorCommandPath = ['operations', 'get-operations-by-cursor'] as const;
const defaultOperationsByCursorSdkFactory: OperationsByCursorSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const operationStates = {
  unspecified: OperationState.OPERATION_STATE_UNSPECIFIED,
  executed: OperationState.OPERATION_STATE_EXECUTED,
  canceled: OperationState.OPERATION_STATE_CANCELED,
  progress: OperationState.OPERATION_STATE_PROGRESS
} as const;

type OperationStateName = keyof typeof operationStates;

const operationStateNames = Object.keys(operationStates) as OperationStateName[];

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
type OperationsByCursorRequestOptions = CommandRequestOptions<
  OperationsByCursorOptions,
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


export function parseOperationsByCursorState(rawOptions: CommandRawOptions): OperationState {
  const { state } = parseCommandOptions(rawOptions, operationsByCursorStateOptionsSchema);

  return operationStates[state];
}

export function parseOperationsByCursorLimit(rawOptions: CommandRawOptions): number {
  const { limit } = parseCommandOptions(rawOptions, operationsByCursorLimitOptionsSchema);

  return parseOperationsByCursorLimitOption(limit);
}

function parseOperationsByCursorLimitOption(rawValue: string | undefined): number {
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

export function parseOperationsByCursorOperationTypes(rawOptions: CommandRawOptions): OperationType[] {
  const options = parseCommandOptions(rawOptions, operationsByCursorOperationTypesOptionsSchema);

  return parseOperationsByCursorOperationTypesOption(options['operation-type']);
}

function parseOperationsByCursorOperationTypesOption(
  rawValue: string | undefined
): OperationType[] {
  if (rawValue === undefined) {
    return [];
  }

  const operationTypes = parseCommaSeparatedStringListOption(rawValue, 'operation-type');

  return operationTypes.map((value) => {
    const operationType = operationTypeFromJSON(value);

    if (operationType === OperationType.UNRECOGNIZED) {
      throw new Error("Expected '--operation-type' as generated OperationType name");
    }

    return operationType;
  });
}


export function parseOperationsByCursorFormat(rawOptions: CommandRawOptions): OperationsByCursorFormat {
  return parseCommandOptions(rawOptions, operationsByCursorFormatOptionsSchema).format;
}

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
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.operations.getOperationsByCursor(request);

    return formatOperationsByCursor(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatOperationsByCursor };

export function createOperationsByCursorRequest(
  options: OperationsByCursorRequestOptions
): GetOperationsByCursorRequest {
  const from = parseOptionalDateTimeOption(options.from, 'from');
  const to = parseOptionalDateTimeOption(options.to, 'to');

  if (from !== undefined && to !== undefined && from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    accountId: options['account-id'],
    instrumentId: options['instrument-id'] ?? '',
    from,
    to,
    cursor: options.cursor ?? '',
    limit: parseOperationsByCursorLimitOption(options.limit),
    operationTypes: parseOperationsByCursorOperationTypesOption(options['operation-type']),
    state: operationStates[options.state],
    withoutCommissions: options['without-commissions'],
    withoutTrades: options['without-trades'],
    withoutOvernights: options['without-overnights']
  };
}

function parseOptionalDateTimeOption(value: string | undefined, name: string): Date | undefined {
  if (value === undefined) {
    return undefined;
  }

  return parseDateTimeOption(value, name);
}
