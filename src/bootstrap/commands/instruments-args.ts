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
  const status = ArgGuards.optionalStringArgValue(argv, 'instrument-status') ?? 'base';

  if (!(status in instrumentStatuses)) {
    throw new Error(
      `Expected '--instrument-status' as one of: ${Object.keys(instrumentStatuses).join(', ')}`
    );
  }

  return instrumentStatuses[status as InstrumentStatusName];
}

export function parseInstrumentsRequest(argv: CliArgs): InstrumentsRequest {
  return {
    instrumentStatus: parseInstrumentStatus(argv)
  };
}
