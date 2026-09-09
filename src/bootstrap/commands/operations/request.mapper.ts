/**
 * Модуль хранит request mapping, общий для production и Sandbox operations.
 *
 * Здесь допустимы generated enum mapping и request-level проверка диапазона.
 * Здесь не должно быть command schema, SDK calls или rendering.
 */

import {
  OperationState,
  type OperationsRequest
} from '../../../generated/operations';
import { CliUsageError } from 'icore';
import { parseDateTimeOption } from '../../args/command-options';
import { resolveOptionalInstrumentIdOption } from '../../args/instrument-id-options';

const operationStates = {
  unspecified: OperationState.OPERATION_STATE_UNSPECIFIED,
  executed: OperationState.OPERATION_STATE_EXECUTED,
  canceled: OperationState.OPERATION_STATE_CANCELED,
  progress: OperationState.OPERATION_STATE_PROGRESS
} as const;

interface OperationsRequestOptions {
  readonly 'account-id': string;
  readonly from: string;
  readonly to: string;
  readonly state: keyof typeof operationStates;
  readonly 'instrument-id'?: string | undefined;
  readonly figi?: string | undefined;
}

export function createOperationsRequest(
  options: OperationsRequestOptions
): OperationsRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new CliUsageError("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    accountId: options['account-id'],
    from,
    to,
    state: operationStates[options.state],
    figi: resolveOptionalInstrumentIdOption(options) ?? ''
  };
}
