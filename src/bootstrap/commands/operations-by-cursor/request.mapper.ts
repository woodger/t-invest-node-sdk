/**
 * Модуль хранит request mapping, общий для постраничных production и Sandbox operations.
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

const operationStates = {
  unspecified: OperationState.OPERATION_STATE_UNSPECIFIED,
  executed: OperationState.OPERATION_STATE_EXECUTED,
  canceled: OperationState.OPERATION_STATE_CANCELED,
  progress: OperationState.OPERATION_STATE_PROGRESS
} as const;

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

export function createOperationsByCursorRequest(
  options: OperationsByCursorRequestOptions
): GetOperationsByCursorRequest {
  const from = parseOptionalDateTimeOption(options.from, 'from');
  const to = parseOptionalDateTimeOption(options.to, 'to');

  if (from !== undefined && to !== undefined && from.getTime() > to.getTime()) {
    throw new CliUsageError("Expected '--from' to be earlier than or equal to '--to'");
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

function parseOperationsByCursorLimitOption(rawValue: string | undefined): number {
  if (rawValue === undefined) {
    return 0;
  }

  if (!/^\d+$/.test(rawValue)) {
    throw new CliUsageError("Expected '--limit' as integer from 1 to 1000");
  }

  const limit = Number(rawValue);

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) {
    throw new CliUsageError("Expected '--limit' as integer from 1 to 1000");
  }

  return limit;
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
      throw new CliUsageError("Expected '--operation-type' as generated OperationType name");
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
