/**
 * Общие parsers CLI-аргументов для instruments-команд.
 *
 * Здесь допустим только разбор shared request fragments generated
 * InstrumentsService. Command-specific flags остаются в конкретных командах.
 */

import {
  InstrumentIdType,
  InstrumentStatus,
  type InstrumentRequest,
  type InstrumentsRequest
} from '../../generated/instruments';
import { parseOptions, type RawOptionValue } from 'icore';
import { ArgGuards } from '../args';
import type { CliArgs } from '../cli-contract';

export const instrumentLookupArgNames = new Set([
  'id',
  'id-type',
  'class-code'
]);

export const instrumentStatusArgNames = new Set([
  'instrument-status'
]);

const instrumentIdTypes = {
  figi: InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI,
  ticker: InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER,
  uid: InstrumentIdType.INSTRUMENT_ID_TYPE_UID,
  'position-uid': InstrumentIdType.INSTRUMENT_ID_TYPE_POSITION_UID
} as const;

type InstrumentIdTypeName = keyof typeof instrumentIdTypes;

const instrumentStatuses = {
  unspecified: InstrumentStatus.INSTRUMENT_STATUS_UNSPECIFIED,
  base: InstrumentStatus.INSTRUMENT_STATUS_BASE,
  all: InstrumentStatus.INSTRUMENT_STATUS_ALL
} as const;

type InstrumentStatusName = keyof typeof instrumentStatuses;

export const instrumentStatusNames = Object.keys(instrumentStatuses) as InstrumentStatusName[];

export const instrumentStatusOptionsSchema = {
  'instrument-status': {
    type: 'string',
    choices: instrumentStatusNames,
    default: 'base'
  }
} as const;

export function parseInstrumentLookupIdType(argv: CliArgs): InstrumentIdType {
  const idType = ArgGuards.requireStringArg(argv, 'id-type');

  if (!(idType in instrumentIdTypes)) {
    throw new Error(`Expected '--id-type' as one of: ${Object.keys(instrumentIdTypes).join(', ')}`);
  }

  return instrumentIdTypes[idType as InstrumentIdTypeName];
}

export function parseInstrumentLookupRequest(argv: CliArgs): InstrumentRequest {
  const idType = parseInstrumentLookupIdType(argv);
  const classCode = ArgGuards.optionalStringArgValue(argv, 'class-code') ?? '';

  if (idType === InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER && classCode === '') {
    throw new Error("Expected required argument '--class-code' when '--id-type=ticker'");
  }

  return {
    id: ArgGuards.requireStringArg(argv, 'id'),
    idType,
    classCode
  };
}

export function parseInstrumentStatus(argv: CliArgs): InstrumentStatus {
  const options = parseOptions(
    instrumentStatusOptionsSchema,
    toRawInstrumentStatusOption(argv)
  );
  const status = options['instrument-status'];

  return instrumentStatuses[status];
}

export function parseInstrumentsRequest(argv: CliArgs): InstrumentsRequest {
  return {
    instrumentStatus: parseInstrumentStatus(argv)
  };
}

function toRawInstrumentStatusOption(argv: CliArgs): Record<string, RawOptionValue> {
  const value = argv['instrument-status'];

  if (value === undefined) {
    return {};
  }

  if (typeof value !== 'string' && typeof value !== 'boolean') {
    throw new Error("Expected '--instrument-status' as scalar option");
  }

  return {
    'instrument-status': value
  };
}
