/**
 * Модуль хранит request mapping, общий для постраничных production и Sandbox
 * operations.
 *
 * Здесь допустимы generated enum mapping, pagination и проверка диапазона.
 * Здесь не должно быть command schema, SDK calls или rendering.
 */

import {
  OperationState,
  OperationType,
  operationTypeFromJSON,
  type GetOperationsByCursorRequest
} from '../../../generated/operations';
import { CliUsageError } from 'icore';
import {
  parseCommaSeparatedStringListOption,
  parseDateTimeOption
} from '../../args/command-options';

interface OperationsByCursorRequestOptions {
  readonly 'account-id': string;
  readonly 'instrument-id'?: string | undefined;
  readonly 'operation-type'?: string | undefined;
  readonly 'without-commissions': boolean;
  readonly 'without-trades': boolean;
  readonly 'without-overnights': boolean;
  readonly from?: string | undefined;
  readonly to?: string | undefined;
  readonly cursor?: string | undefined;
  readonly limit?: string | undefined;
  readonly state: keyof typeof operationStates;
}

const minOperationsByCursorPageSize = 1;
const maxOperationsByCursorPageSize = 1_000;

const operationStates = {
  unspecified: OperationState.OPERATION_STATE_UNSPECIFIED,
  executed: OperationState.OPERATION_STATE_EXECUTED,
  canceled: OperationState.OPERATION_STATE_CANCELED,
  progress: OperationState.OPERATION_STATE_PROGRESS
} as const;

export function createOperationsByCursorRequest(
  options: OperationsByCursorRequestOptions
): GetOperationsByCursorRequest {
  const from = parseOptionalDateTimeOption(options.from, 'from');
  const to = parseOptionalDateTimeOption(options.to, 'to');

  if (from !== undefined && to !== undefined && from.getTime() > to.getTime()) {
    throw new CliUsageError(
      "Expected '--from' to be earlier than or equal to '--to'"
    );
  }

  return {
    accountId: options['account-id'],
    instrumentId: options['instrument-id'] ?? '',
    from,
    to,
    cursor: options.cursor ?? '',
    limit: parseOperationsByCursorLimitOption(options.limit),
    operationTypes: parseOperationsByCursorOperationTypesOption(
      options['operation-type']
    ),
    state: operationStates[options.state],
    withoutCommissions: options['without-commissions'],
    withoutTrades: options['without-trades'],
    withoutOvernights: options['without-overnights']
  };
}

function parseOperationsByCursorLimitOption(
  rawValue: string | undefined
): number {
  if (rawValue === undefined) {
    return 0;
  }

  if (!/^\d+$/.test(rawValue)) {
    throw new CliUsageError(operationsByCursorPageSizeError);
  }

  const limit = Number(rawValue);

  if (
    !Number.isSafeInteger(limit)
    || limit < minOperationsByCursorPageSize
    || limit > maxOperationsByCursorPageSize
  ) {
    throw new CliUsageError(operationsByCursorPageSizeError);
  }

  return limit;
}

const operationsByCursorPageSizeError =
  `Expected '--limit' as integer from ${minOperationsByCursorPageSize} to ${maxOperationsByCursorPageSize}`;

function parseOperationsByCursorOperationTypesOption(
  rawValue: string | undefined
): OperationType[] {
  if (rawValue === undefined) {
    return [];
  }

  const operationTypes = parseCommaSeparatedStringListOption(
    rawValue,
    'operation-type'
  );

  return operationTypes.map((value) => {
    const operationType = operationTypeFromJSON(value);

    if (operationType === OperationType.UNRECOGNIZED) {
      throw new CliUsageError(
        "Expected '--operation-type' as generated OperationType name"
      );
    }

    return operationType;
  });
}

function parseOptionalDateTimeOption(
  value: string | undefined,
  name: string
): Date | undefined {
  if (value === undefined) {
    return undefined;
  }

  return parseDateTimeOption(value, name);
}
