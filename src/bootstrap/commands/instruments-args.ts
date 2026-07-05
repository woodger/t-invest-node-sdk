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
import type { CommandRawOptions } from './command-options';

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

export function parseInstrumentLookupIdType(rawOptions: CommandRawOptions): InstrumentIdType {
  const options = parseOptions(
    instrumentLookupIdTypeOptionsSchema,
    toRawOptionValues(rawOptions, ['id-type'])
  );

  return instrumentIdTypes[options['id-type']];
}

export function createInstrumentLookupRequestFromOptions(
  options: {
    id?: string;
    'id-type'?: InstrumentIdTypeName;
    'class-code'?: string;
  }
): InstrumentRequest {
  const idType = parseOptions(
    instrumentLookupIdTypeOptionsSchema,
    toDefinedRawOptionValues({ 'id-type': options['id-type'] })
  )['id-type'];
  const classCode = options['class-code'] ?? '';

  if (instrumentIdTypes[idType] === InstrumentIdType.INSTRUMENT_ID_TYPE_TICKER && classCode === '') {
    throw new Error("Expected required argument '--class-code' when '--id-type=ticker'");
  }

  const id = parseOptions(
    instrumentLookupIdOptionsSchema,
    toDefinedRawOptionValues({ id: options.id })
  ).id;

  return {
    id,
    idType: instrumentIdTypes[idType],
    classCode
  };
}

export function parseInstrumentStatus(rawOptions: CommandRawOptions): InstrumentStatus {
  const options = parseOptions(
    instrumentStatusOptionsSchema,
    toRawOptionValues(rawOptions, ['instrument-status'])
  );
  const status = options['instrument-status'];

  return instrumentStatuses[status];
}

export function createInstrumentsRequestFromOptions(
  options: { 'instrument-status': InstrumentStatusName }
): InstrumentsRequest {
  return {
    instrumentStatus: instrumentStatuses[options['instrument-status']]
  };
}

function toRawOptionValues(
  rawOptions: CommandRawOptions,
  names: readonly string[]
): Record<string, RawOptionValue> {
  const options: Record<string, RawOptionValue> = {};

  for (const name of names) {
    const value = rawOptions[name];

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

function toDefinedRawOptionValues(
  options: Record<string, RawOptionValue | undefined>
): Record<string, RawOptionValue> {
  const result: Record<string, RawOptionValue> = {};

  for (const [name, value] of Object.entries(options)) {
    if (value !== undefined) {
      result[name] = value;
    }
  }

  return result;
}
