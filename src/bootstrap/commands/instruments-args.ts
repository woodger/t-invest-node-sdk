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

const instrumentIdTypeNames = Object.keys(instrumentIdTypes) as InstrumentIdTypeName[];

const instrumentLookupIdOptionsSchema = {
  id: {
    type: 'string',
    required: true
  }
} as const;

const instrumentLookupIdTypeOptionsSchema = {
  'id-type': {
    type: 'string',
    choices: instrumentIdTypeNames,
    required: true
  }
} as const;

const instrumentLookupClassCodeOptionsSchema = {
  'class-code': {
    type: 'string'
  }
} as const;

export const instrumentLookupOptionsSchema = {
  id: {
    type: 'string'
  },
  'id-type': {
    type: 'string',
    choices: instrumentIdTypeNames
  },
  ...instrumentLookupClassCodeOptionsSchema
} as const;

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
  const options = parseOptions(
    instrumentLookupIdTypeOptionsSchema,
    toRawOptionValues(argv, ['id-type'])
  );

  return instrumentIdTypes[options['id-type']];
}

export function parseInstrumentLookupRequest(argv: CliArgs): InstrumentRequest {
  const idType = parseInstrumentLookupIdType(argv);
  const classCodeOptions = parseOptions(
    instrumentLookupClassCodeOptionsSchema,
    toRawOptionValues(argv, ['class-code'])
  );
  const classCode = classCodeOptions['class-code'] ?? '';

  if (idType === InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER && classCode === '') {
    throw new Error("Expected required argument '--class-code' when '--id-type=ticker'");
  }

  const idOptions = parseOptions(
    instrumentLookupIdOptionsSchema,
    toRawOptionValues(argv, ['id'])
  );

  return {
    id: idOptions.id,
    idType,
    classCode
  };
}

export function parseInstrumentStatus(argv: CliArgs): InstrumentStatus {
  const options = parseOptions(
    instrumentStatusOptionsSchema,
    toRawOptionValues(argv, ['instrument-status'])
  );
  const status = options['instrument-status'];

  return instrumentStatuses[status];
}

export function parseInstrumentsRequest(argv: CliArgs): InstrumentsRequest {
  return {
    instrumentStatus: parseInstrumentStatus(argv)
  };
}

function toRawOptionValues(
  argv: CliArgs,
  names: readonly string[]
): Record<string, RawOptionValue> {
  const options: Record<string, RawOptionValue> = {};

  for (const name of names) {
    const value = argv[name];

    if (value === undefined) {
      continue;
    }

    if (typeof value !== 'string' && typeof value !== 'boolean') {
      throw new Error(`Expected '--${name}' as scalar option`);
    }

    options[name] = value;
  }

  return options;
}
