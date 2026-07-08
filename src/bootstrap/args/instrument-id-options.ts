/**
 * Модуль instrument id CLI options хранит compatibility contract для instrument filters.
 *
 * Здесь допустимы:
 * - канонический `--instrument-id` option schema;
 * - deprecated `--figi` alias для старых CLI-контрактов;
 * - единая проверка конфликта между новым и старым option names;
 *
 * Здесь не должно быть generated request mapping или command-specific option parsing.
 */

export const instrumentIdWithDeprecatedFigiOptionsSchema = {
  'instrument-id': {
    type: 'string'
  },
  figi: {
    type: 'string'
  }
} as const;

export type InstrumentIdAliasOptions = {
  'instrument-id'?: string | undefined;
  figi?: string | undefined;
};

export function resolveInstrumentIdOption(options: InstrumentIdAliasOptions): string {
  return resolveInstrumentId(options, true) ?? '';
}

export function resolveOptionalInstrumentIdOption(
  options: InstrumentIdAliasOptions
): string | undefined {
  return resolveInstrumentId(options, false);
}

function resolveInstrumentId(
  options: InstrumentIdAliasOptions,
  required: boolean
): string | undefined {
  const instrumentId = options['instrument-id'];
  const figi = options.figi;

  if (instrumentId !== undefined && figi !== undefined) {
    throw new Error("Use either '--instrument-id' or deprecated '--figi', not both");
  }

  if (instrumentId !== undefined) {
    return instrumentId;
  }

  if (figi !== undefined) {
    return figi;
  }

  if (required) {
    throw new Error("Expected '--instrument-id'");
  }

  return undefined;
}
